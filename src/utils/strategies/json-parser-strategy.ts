import { documentParserRegistry } from '../document-parser-registry';
import { DocumentParserStrategy } from '../document-parser-strategy';

export const jsonParserStrategy: DocumentParserStrategy = {
  mode: 'json',
  extractSchemaUrl(documentText: string): string | null {
    try {
      const parsed = JSON.parse(documentText);
      if (parsed && typeof parsed === 'object' && typeof parsed.$schema === 'string') {
        return parsed.$schema;
      }
    } catch {}
    return null;
  }
};

documentParserRegistry.register(jsonParserStrategy);
