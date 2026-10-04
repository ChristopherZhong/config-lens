export interface DocumentFormatterStrategy {
  mode: string;
  format(content: string): string;
}
