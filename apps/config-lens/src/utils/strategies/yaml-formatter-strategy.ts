import * as jsYaml from 'js-yaml';
import { DocumentFormatterStrategy } from '../document-formatter-strategy';
import { documentFormatterRegistry } from '../document-formatter-registry';

export const yamlFormatterStrategy: DocumentFormatterStrategy = {
  mode: 'yaml',
  format(content: string): string {
    const parsed = jsYaml.load(content);
    return jsYaml.dump(parsed);
  }
};

documentFormatterRegistry.register(yamlFormatterStrategy);
