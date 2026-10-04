export interface DocumentParserStrategy {
  mode: string;
  extractSchemaUrl(docText: string): string | null;
}
