import { DocumentFormatterStrategy } from '../document-formatter-strategy';
import { documentFormatterRegistry } from '../document-formatter-registry';

export const jsonFormatterStrategy: DocumentFormatterStrategy = {
  mode: 'json',
  format(content: string): string {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  }
};

documentFormatterRegistry.register(jsonFormatterStrategy);
