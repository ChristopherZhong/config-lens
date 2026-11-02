import { DocumentValidationParserStrategy } from '../document-validation-parser-strategy';
import { documentValidationParserRegistry } from '../document-validation-parser-registry';

export const jsonValidationParserStrategy: DocumentValidationParserStrategy = {
  mode: 'json',
  parse(documentText: string) {
    try {
      const data = JSON.parse(documentText);
      return { data };
    } catch (e: any) {
      let matchPosition: number | undefined;
      const match = e.message?.match(/at position (\d+)/);
      if (match) {
        matchPosition = parseInt(match[1], 10);
      }
      return { data: null, error: { message: e.message, matchPosition } };
    }
  }
};

documentValidationParserRegistry.register(jsonValidationParserStrategy);
