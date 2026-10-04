import * as jsYaml from 'js-yaml';

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

export const documentParserRegistry = new DocumentParserRegistry();
documentParserRegistry.register(jsonParserStrategy);
documentParserRegistry.register(yamlParserStrategy);
