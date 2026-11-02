import { DocumentValidationParserStrategy } from './document-validation-parser-strategy';

export class DocumentValidationParserRegistry {
  private strategies = new Map<string, DocumentValidationParserStrategy>();

  register(strategy: DocumentValidationParserStrategy): void {
    if (this.strategies.has(strategy.mode)) {
      console.warn(`[${DocumentValidationParserRegistry.name}] Strategy for mode '${strategy.mode}' is already registered; duplicate registration will be ignored.`);
      return;
    }
    this.strategies.set(strategy.mode, strategy);
  }

  get(mode: string): DocumentValidationParserStrategy | undefined {
    return this.strategies.get(mode);
  }

  parse(mode: string, documentText: string): { data: unknown; error?: { message: string; markPosition?: number; matchPosition?: number } } {
    const strategy = this.get(mode);
    if (!strategy) {
      throw new Error(`No validation parser strategy registered for mode '${mode}'`);
    }
    return strategy.parse(documentText);
  }
}

export const documentValidationParserRegistry = new DocumentValidationParserRegistry();
