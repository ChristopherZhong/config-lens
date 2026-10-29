import { SyntaxNode } from '@lezer/common';
import { SchemaPositionStrategy } from '../schema-position-strategy';
import { schemaPositionRegistry } from '../schema-position-registry';

function getNodeText(node: SyntaxNode, documentText: string): string {
  const raw = documentText.slice(node.from, node.to).trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function isKeyNodeMatch(keyNode: SyntaxNode, segment: string, documentText: string): boolean {
  const from = keyNode.from;
  const to = keyNode.to;
  const span = to - from;
  const segmentLength = segment.length;

  if (span < segmentLength) {
    return false;
  }

  const firstChar = documentText.charCodeAt(from);
  const lastChar = documentText.charCodeAt(to - 1);
  const isQuoted = (firstChar === 34 && lastChar === 34) || (firstChar === 39 && lastChar === 39);

  const maxKeyLength = isQuoted ? span - 2 : span;
  if (maxKeyLength < segmentLength) {
    return false;
  }

  if (maxKeyLength === segmentLength) {
    if (isQuoted) {
      // Optimization: Direct character code iteration avoids documentText.slice(...) string heap allocations
      // during AST key node matching in schema position traversals for quoted property keys.
      for (let i = 0; i < segmentLength; i++) {
        if (documentText.charCodeAt(from + 1 + i) !== segment.charCodeAt(i)) {
          return false;
        }
      }
      return true;
    }
    return documentText.slice(from, to).trim() === segment;
  }

  return getNodeText(keyNode, documentText) === segment;
}

export const jsonPositionStrategy: SchemaPositionStrategy = {
  mode: 'json',

  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Property') {
      // Optimization: In JSON Lezer AST, the first child of a Property node is always the key node.
      // Returning firstChild directly avoids O(children) getChild child-traversal iterations.
      return propertyNode.firstChild;
    }
    return null;
  },

  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Property') {
      let child = propertyNode.firstChild;
      let foundColon = false;
      while (child) {
        if (foundColon && child.name !== 'Comment') {
          return child;
        }
        if (child.name === ':') {
          foundColon = true;
        }
        child = child.nextSibling;
      }
      return propertyNode.lastChild !== propertyNode.firstChild ? propertyNode.lastChild : null;
    }
    return null;
  },

  findChildNode(containerNode: SyntaxNode, segment: string, documentText: string): SyntaxNode | null {
    let targetContainer = containerNode;

    while (targetContainer.name === 'JsonText') {
      if (targetContainer.firstChild) {
        targetContainer = targetContainer.firstChild;
      } else {
        break;
      }
    }

    const containerName = targetContainer.name;

    if (containerName === 'Object') {
      let child = targetContainer.firstChild;
      while (child) {
        if (child.name === 'Property') {
          const keyNode = child.firstChild;
          if (keyNode && isKeyNodeMatch(keyNode, segment, documentText)) {
            return child;
          }
        }
        child = child.nextSibling;
      }
    }

    if (containerName === 'Array') {
      const index = parseInt(segment, 10);
      if (!isNaN(index) && index >= 0) {
        let count = 0;
        let child = targetContainer.firstChild;
        while (child) {
          if (
            child.name !== '[' &&
            child.name !== ']' &&
            child.name !== ',' &&
            child.name !== 'Comment'
          ) {
            if (count === index) {
              return child;
            }
            count++;
          }
          child = child.nextSibling;
        }
      }
    }

    return null;
  }
};

schemaPositionRegistry.register(jsonPositionStrategy);
