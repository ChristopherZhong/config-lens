import * as jsYaml from 'js-yaml';
import { documentParserRegistry } from '../document-parser-registry';
import { DocumentParserStrategy } from '../document-parser-strategy';

export const yamlParserStrategy: DocumentParserStrategy = {
  mode: 'yaml',
  extractSchemaUrl(documentText: string): string | null {
    try {
      const parsed: unknown = jsYaml.load(documentText);
      if (parsed && typeof parsed === 'object' && parsed !== null && typeof (parsed as Record<string, unknown>).$schema === 'string') {
        return (parsed as Record<string, unknown>).$schema as string;
      }
    } catch {}
    return null;
  }
};

documentParserRegistry.register(yamlParserStrategy);
