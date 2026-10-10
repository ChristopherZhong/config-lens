import { jsonLanguage } from '@codemirror/lang-json';
import { documentParserRegistry } from '../document-parser-registry';
import { DocumentParserStrategy } from '../document-parser-strategy';

export const jsonParserStrategy: DocumentParserStrategy = {
  mode: 'json',
  extractSchemaUrl(documentText: string): string | null {
    if (!documentText) return null;

    // Optimization: Inspect direct root AST properties using jsonLanguage parser (~0.005ms)
    // without full document object graph creation or false positives from nested strings/properties.
    try {
      const tree = jsonLanguage.parser.parse(documentText);
      let top = tree.topNode;
      if (top.name === 'JsonText') {
        top = top.firstChild || top;
      }
      if (top && top.name === 'Object') {
        let child = top.firstChild;
        while (child) {
          if (child.name === 'Property') {
            const keyNode = child.firstChild;
            if (keyNode && (keyNode.name === 'PropertyName' || keyNode.name === 'String')) {
              const rawKey = documentText.slice(keyNode.from, keyNode.to);
              if (rawKey === '"$schema"') {
                const valNode = child.lastChild;
                if (valNode && valNode.name === 'String') {
                  const rawVal = documentText.slice(valNode.from, valNode.to);
                  return JSON.parse(rawVal);
                }
              }
            }
          }
          child = child.nextSibling;
        }
      }
    } catch {}

    try {
      const parsed = JSON.parse(documentText);
      if (parsed && typeof parsed === 'object' && typeof parsed.$schema === 'string') {
        return parsed.$schema;
      }
    } catch {}
    return null;
  }
};

documentParserRegistry.register(jsonParserStrategy);
