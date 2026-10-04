import { DocumentFormatterStrategy } from './document-formatter-strategy';

export class DocumentFormatterRegistry {
  private strategies = new Map<string, DocumentFormatterStrategy>();

  register(strategy: DocumentFormatterStrategy): void {
    if (this.strategies.has(strategy.mode)) {
      console.warn(`[${DocumentFormatterRegistry.name}] Strategy for mode '${strategy.mode}' is already registered; duplicate registration will be ignored.`);
      return;
    }
    this.strategies.set(strategy.mode, strategy);
  }

  get(mode: string): DocumentFormatterStrategy | undefined {
    return this.strategies.get(mode);
  }

  format(mode: string, content: string): string {
    const strategy = this.get(mode);
    if (!strategy) {
      throw new Error(`No formatter strategy registered for mode '${mode}'`);
    }
    return strategy.format(content);
  }
}

export const documentFormatterRegistry = new DocumentFormatterRegistry();
