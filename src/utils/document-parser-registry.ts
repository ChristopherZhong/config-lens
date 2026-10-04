import { jsonParserStrategy, yamlParserStrategy } from './document-parser-strategies';

export interface DocumentParserStrategy {
  mode: string;
  extractSchemaUrl(docText: string): string | null;
}

export class DocumentParserRegistry {
  private strategies = new Map<string, DocumentParserStrategy>();

  register(strategy: DocumentParserStrategy): void {
    if (this.strategies.has(strategy.mode)) {
      console.warn(`[DocumentParserRegistry] Strategy for mode '${strategy.mode}' is already registered; duplicate registration will be ignored.`);
      return;
    }
    this.strategies.set(strategy.mode, strategy);
  }

  get(mode: string): DocumentParserStrategy | undefined {
    return this.strategies.get(mode);
  }

  extractSchemaUrl(mode: string, docText: string): string | null {
    const strategy = this.get(mode);
    return strategy ? strategy.extractSchemaUrl(docText) : null;
  }
}

export { jsonParserStrategy, yamlParserStrategy } from './document-parser-strategies';

export const documentParserRegistry = new DocumentParserRegistry();
documentParserRegistry.register(jsonParserStrategy);
documentParserRegistry.register(yamlParserStrategy);
