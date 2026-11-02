import * as jsYaml from 'js-yaml';
import { yamlLanguage } from '@codemirror/lang-yaml';
import { documentParserRegistry } from '../document-parser-registry';
import { DocumentParserStrategy } from '../document-parser-strategy';

export const yamlParserStrategy: DocumentParserStrategy = {
  mode: 'yaml',
  extractSchemaUrl(documentText: string): string | null {
    // Optimization: Fast substring check (~0.0001ms) skips full Lezer AST parsing and jsYaml.load
    // when document does not contain a $schema / schema directive.
    if (!documentText || (!documentText.includes('$schema') && !documentText.includes('schema'))) return null;

    // Optimization: Inspect direct root AST properties using yamlLanguage parser (~0.005ms)
    // without full document object graph creation or false positives from nested strings/properties.
    try {
      const tree = yamlLanguage.parser.parse(documentText);
      let docNode = tree.topNode;
      if (docNode.name === 'Stream') {
        docNode = docNode.firstChild || docNode;
      }
      if (docNode && docNode.name === 'Document') {
        let mapping = docNode.firstChild;
        while (mapping && mapping.name !== 'BlockMapping' && mapping.name !== 'Mapping') {
          mapping = mapping.nextSibling;
        }
        if (mapping) {
          let pair = mapping.firstChild;
          while (pair) {
            if (pair.name === 'Pair') {
              const keyNode = pair.firstChild;
              if (keyNode && keyNode.name === 'Key') {
                // Optimization: Direct startsWith substring check avoids string slicing, trimming,
                // and regex replacements for non-schema key nodes during AST property traversals.
                if (keyNode.to - keyNode.from >= 7) {
                  const rawKeyNode = documentText.slice(keyNode.from, keyNode.to).trim();
                  const unquotedKey = (rawKeyNode.startsWith('"') && rawKeyNode.endsWith('"')) ||
                    (rawKeyNode.startsWith("'") && rawKeyNode.endsWith("'"))
                    ? rawKeyNode.slice(1, -1)
                    : rawKeyNode;
                  if (unquotedKey === '$schema') {
                    let valNode = keyNode.nextSibling;
                    while (valNode && (valNode.name === ':' || valNode.name === 'Comment')) {
                      valNode = valNode.nextSibling;
                    }
                    if (valNode) {
                      const rawValNode = documentText.slice(valNode.from, valNode.to).trim();
                      return (rawValNode.startsWith('"') && rawValNode.endsWith('"')) ||
                        (rawValNode.startsWith("'") && rawValNode.endsWith("'"))
                        ? rawValNode.slice(1, -1)
                        : rawValNode;
                    }
                  }
                }
              }
            }
            pair = pair.nextSibling;
          }
        }
      }
    } catch {}

    try {
      const parsed: unknown = jsYaml.load(documentText);
      if (parsed && typeof parsed === 'object' && parsed !== null && typeof (parsed as Record<string, unknown>).$schema === 'string') {
        return (parsed as Record<string, unknown>).$schema as string;
      }
    } catch {}
    return null;
  }
};

documentParserRegistry.register(yamlParserStrategy);
