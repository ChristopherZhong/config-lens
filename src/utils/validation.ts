import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { jsonLanguage } from '@codemirror/lang-json';
import { yamlLanguage } from '@codemirror/lang-yaml';
import { findPositionForPath } from './schema-position';
import { documentValidationParserRegistry } from './document-validation-parser-registry';
import './strategies/json-validation-parser-strategy';
import './strategies/yaml-validation-parser-strategy';

const ajv = new Ajv({
  allErrors: true,
  verbose: true
});
addFormats(ajv);

const schemaCache = new Map<string, any>();
const validatorCache = new Map<string, ValidateFunction>();

// Optimization: Cache active in-flight promises to deduplicate parallel network fetches
// and AJV compilations triggered during fast user typing in the editor.
const schemaPromiseCache = new Map<string, Promise<any>>();
const validatorPromiseCache = new Map<string, Promise<ValidateFunction | null>>();

/**
 * Validates that a given string is a valid HTTP or HTTPS URL to prevent loading unsafe protocol schemes,
 * local addresses, loopback endpoints, and private network IP ranges.
 */
function isValidHttpUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    const cleanHost = hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '');
    // Prevent SSRF and Private Network Access via loopback, local/internal domains,
    // wildcard DNS services (.nip.io, .sslip.io, etc.), private IP ranges, and integer IP formats.
    if (
      cleanHost === 'localhost' ||
      cleanHost.endsWith('.local') ||
      cleanHost.endsWith('.internal') ||
      cleanHost.endsWith('.localhost') ||
      cleanHost.endsWith('.localdomain') ||
      cleanHost.endsWith('.nip.io') ||
      cleanHost.endsWith('.sslip.io') ||
      cleanHost.endsWith('.xip.io') ||
      cleanHost.startsWith('0.') ||
      cleanHost.startsWith('127.') ||
      cleanHost.startsWith('10.') ||
      cleanHost.startsWith('169.254.') ||
      cleanHost.startsWith('192.168.') ||
      cleanHost.startsWith('::ffff:') ||
      cleanHost.includes('::ffff:') ||
      cleanHost === '::' ||
      cleanHost === '0:0:0:0:0:0:0:0' ||
      cleanHost.startsWith('fe80:') ||
      /^fe[89ab][0-9a-f]:/i.test(cleanHost) ||
      /^f[cd][0-9a-f]{2}:/i.test(cleanHost) ||
      cleanHost === '::1' ||
      cleanHost === '0:0:0:0:0:0:0:1' ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanHost) ||
      /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(cleanHost) ||
      /^(0x[0-9a-f]+|\d+)$/i.test(cleanHost) ||
      /^(0x[0-9a-f]+\.){1,3}(0x[0-9a-f]+)$/i.test(cleanHost) ||
      // Security: Check for IPv4-mapped/compatible IPv6 representations in hex format normalized by URL constructor
      // (e.g. ::ffff:7f00:1 or ::7f00:1 for 127.0.0.1, ::a00:1 for 10.0.0.1, ::c0a8:101 for 192.168.1.1)
      /^::(ffff:)?(0|7f[0-9a-f]{2}|a[0-9a-f]{2}|a9fe|c0a8|ac1[0-9a-f]|64:ff9b|64[4-7][0-9a-f]|100):/i.test(cleanHost)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function normalizeSchemaUrl(url: string): string {
  // Replace json.schemastore.org with www.schemastore.org to prevent CORS redirect blocks in browser fetch
  if (url.startsWith('https://json.schemastore.org/')) {
    return url.replace('https://json.schemastore.org/', 'https://www.schemastore.org/');
  }
  if (url.startsWith('http://json.schemastore.org/')) {
    return url.replace('http://json.schemastore.org/', 'https://www.schemastore.org/');
  }
  return url;
}

export async function fetchSchema(rawUrl: string): Promise<any> {
  if (!isValidHttpUrl(rawUrl)) {
    return null;
  }
  const url = normalizeSchemaUrl(rawUrl);
  if (schemaCache.has(url)) return schemaCache.get(url);
  if (schemaPromiseCache.has(url)) return schemaPromiseCache.get(url);

  const fetchPromise = (async () => {
    try {
      // Security: Enforce a 5-second timeout via AbortSignal to prevent hanging network requests
      // and resource exhaustion when schema endpoints are slow or unresponsive.
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Schema fetch failed');
      const schema = await response.json();
      // Security: Ensure schema response is a valid, non-null JSON object before caching or compiling.
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return null;
      }
      schemaCache.set(url, schema);
      return schema;
    } catch (e) {
      return null;
    } finally {
      schemaPromiseCache.delete(url);
    }
  })();

  schemaPromiseCache.set(url, fetchPromise);
  return fetchPromise;
}

export async function getValidator(url: string): Promise<ValidateFunction | null> {
  if (validatorCache.has(url)) return validatorCache.get(url)!;
  if (validatorPromiseCache.has(url)) return validatorPromiseCache.get(url)!;

  const compilePromise = (async () => {
    const schema = await fetchSchema(url);
    if (!schema) return null;

    try {
      const validate = ajv.compile(schema);
      validatorCache.set(url, validate);
      return validate;
    } catch (e) {
      return null;
    } finally {
      validatorPromiseCache.delete(url);
    }
  })();

  validatorPromiseCache.set(url, compilePromise);
  return compilePromise;
}

export interface ValidationDiagnostic {
  from: number;
  to: number;
  severity: 'error' | 'warning';
  message: string;
}

export async function validateContent(text: string, mode: 'json' | 'yaml'): Promise<ValidationDiagnostic[]> {
  if (!text) return [];

  const diagnostics: ValidationDiagnostic[] = [];

  const parseResult = documentValidationParserRegistry.parse(mode, text);
  if (parseResult.error) {
    let from = 0;
    let to = text.length;

    if (parseResult.error.markPosition !== undefined) {
      from = parseResult.error.markPosition;
      to = from + 1;
    } else if (parseResult.error.matchPosition !== undefined) {
      from = parseResult.error.matchPosition;
      to = from + 1;
    }

    diagnostics.push({
      from,
      to,
      severity: 'error',
      message: parseResult.error.message,
    });
    return diagnostics;
  }

  const data: any = parseResult.data;

  if (
    data &&
    typeof data === 'object' &&
    Object.prototype.hasOwnProperty.call(data, '$schema') &&
    typeof data.$schema === 'string'
  ) {
    const validate = await getValidator(data.$schema);
    if (validate) {
      const valid = validate(data);
      if (!valid && validate.errors) {
        // Optimization: Parse syntax tree once prior to error position mapping loop
        // to prevent O(N) re-parsing of the same document syntax tree across N schema errors.
        const parser = mode === 'json' ? jsonLanguage.parser : yamlLanguage.parser;
        const parsedTree = parser.parse(text);

        validate.errors.forEach(err => {
          const range = findPositionForPath(
            text,
            mode,
            err.instancePath,
            err.keyword,
            err.params,
            parsedTree
          );
          diagnostics.push({
            from: range.from,
            to: range.to,
            severity: 'error',
            message: `Schema: ${err.instancePath || '/'} ${err.message}`,
          });
        });
      }
    }
  }

  return diagnostics;
}

export function clearCaches() {
    schemaCache.clear();
    validatorCache.clear();
    schemaPromiseCache.clear();
    validatorPromiseCache.clear();
}
