import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
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
 * Validates that a given string is a valid HTTP or HTTPS URL to prevent loading unsafe protocol schemes.
 */
function isValidHttpUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
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
      const response = await fetch(url);
      if (!response.ok) throw new Error('Schema fetch failed');
      const schema = await response.json();
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

  if (data && typeof data === 'object' && typeof data.$schema === 'string') {
    const validate = await getValidator(data.$schema);
    if (validate) {
      const valid = validate(data);
      if (!valid && validate.errors) {
        validate.errors.forEach(err => {
          const range = findPositionForPath(
            text,
            mode,
            err.instancePath,
            err.keyword,
            err.params
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
