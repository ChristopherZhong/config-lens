import { DocumentParserStrategy } from '../document-parser-strategy';

export const jsonParserStrategy: DocumentParserStrategy = {
  mode: 'json',
  extractSchemaUrl(docText: string): string | null {
    try {
      const parsed = JSON.parse(docText);
      if (parsed && typeof parsed === 'object' && typeof parsed.$schema === 'string') {
        return parsed.$schema;
      }
    } catch {}
    return null;
  }
};
