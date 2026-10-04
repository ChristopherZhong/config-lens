import * as jsYaml from 'js-yaml';
import { DocumentParserStrategy } from '../document-parser-strategy';

export const yamlParserStrategy: DocumentParserStrategy = {
  mode: 'yaml',
  extractSchemaUrl(docText: string): string | null {
    try {
      const parsed: unknown = jsYaml.load(docText);
      if (parsed && typeof parsed === 'object' && parsed !== null && typeof (parsed as Record<string, unknown>).$schema === 'string') {
        return (parsed as Record<string, unknown>).$schema as string;
      }
    } catch {}
    return null;
  }
};
