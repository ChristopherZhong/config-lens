import { documentParserRegistry } from '../document-parser-registry';
import { jsonParserStrategy } from './json-parser-strategy';
import { yamlParserStrategy } from './yaml-parser-strategy';

export { jsonParserStrategy } from './json-parser-strategy';
export { yamlParserStrategy } from './yaml-parser-strategy';

documentParserRegistry.register(jsonParserStrategy);
documentParserRegistry.register(yamlParserStrategy);
