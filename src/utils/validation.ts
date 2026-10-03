import * as jsYaml from 'js-yaml';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

const schemaCache = new Map<string, any>();
const validatorCache = new Map<string, ValidateFunction>();

// Optimization: Cache active in-flight promises to deduplicate parallel network fetches
// and AJV compilations triggered during fast user typing in the editor.
const schemaPromiseCache = new Map<string, Promise<any>>();
const validatorPromiseCache = new Map<string, Promise<ValidateFunction | null>>();

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
      console.error('Failed to fetch schema', e);
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
      console.error('AJV compile error', e);
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

  let data: any;
  try {
    if (mode === 'json') {
      data = JSON.parse(text);
    } else {
      data = jsYaml.load(text);
    }
  } catch (e: any) {
    // Attempt to extract line/column for better precision
    let from = 0;
    let to = text.length;

    if (mode === 'yaml' && e.mark) {
        from = e.mark.position;
        to = from + 1; // Highlight at least one character
    } else if (mode === 'json') {
        const match = e.message.match(/at position (\d+)/);
        if (match) {
            from = parseInt(match[1], 10);
            to = from + 1;
        }
    }

    diagnostics.push({
      from,
      to,
      severity: 'error',
      message: e.message,
    });
    return diagnostics;
  }

  if (data && typeof data === 'object' && typeof data.$schema === 'string') {
    const validate = await getValidator(data.$schema);
    if (validate) {
      const valid = validate(data);
      if (!valid && validate.errors) {
        validate.errors.forEach(err => {
          // Schema errors are harder to map to precise positions without a source map
          // Keeping document-wide for now or could try to refine if possible
          diagnostics.push({
            from: 0,
            to: text.length,
            severity: 'error',
            message: `Schema: ${err.instancePath} ${err.message}`,
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
