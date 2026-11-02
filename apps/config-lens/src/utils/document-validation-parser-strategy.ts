export interface DocumentValidationParserStrategy {
  mode: string;
  parse(documentText: string): { data: unknown; error?: { message: string; markPosition?: number; matchPosition?: number } };
}
