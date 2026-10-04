export interface DocumentParserStrategy {
  mode: string;
  extractSchemaUrl(documentText: string): string | null;
}
