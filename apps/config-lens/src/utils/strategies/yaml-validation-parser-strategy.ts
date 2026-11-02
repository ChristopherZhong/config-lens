import * as jsYaml from 'js-yaml';
import { DocumentValidationParserStrategy } from '../document-validation-parser-strategy';
import { documentValidationParserRegistry } from '../document-validation-parser-registry';

export const yamlValidationParserStrategy: DocumentValidationParserStrategy = {
  mode: 'yaml',
  parse(documentText: string) {
    try {
      const data = jsYaml.load(documentText);
      return { data };
    } catch (e: any) {
      let markPosition: number | undefined;
      if (e.mark?.position !== undefined) {
        markPosition = e.mark.position;
      }
      return { data: null, error: { message: e.message, markPosition } };
    }
  }
};

documentValidationParserRegistry.register(yamlValidationParserStrategy);
