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

export const yamlPositionStrategy: SchemaPositionStrategy = {
  mode: 'yaml',

  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Pair') {
      // Optimization: In YAML Lezer AST, the first child of a Pair node is either Key or the raw key element.
      // Checking propertyNode.firstChild directly avoids O(children) getChild child-traversal iterations.
      const first = propertyNode.firstChild;
      if (first) {
        return first.name === 'Key' ? (first.firstChild || first) : first;
      }
    }
    return null;
  },

  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Pair') {
      // Optimization: Single-pass child traversal checks for 'Value' node and direct value nodes simultaneously,
      // avoiding redundant O(children) getChild('Value') scans prior to fallback child iteration.
      let child = propertyNode.firstChild;
      let pastKey = false;
      let lastNonCommentChild: SyntaxNode | null = null;
      while (child) {
        if (child.name === 'Value') {
          return child.firstChild || child;
        }
        if (pastKey && child.name !== ':' && child.name !== 'Comment') {
          return child;
        }
        if (child.name === 'Key' || child.name === ':') {
          pastKey = true;
        }
        if (child.name !== 'Comment') {
          lastNonCommentChild = child;
        }
        child = child.nextSibling;
      }
      return lastNonCommentChild || propertyNode.lastChild;
    }
    return null;
  },

  findChildNode(containerNode: SyntaxNode, segment: string, documentText: string): SyntaxNode | null {
    let targetContainer = containerNode;

    while (targetContainer.name === 'Stream' || targetContainer.name === 'Document') {
      let child = targetContainer.firstChild;
      let foundInner = false;
      while (child) {
        if (
          child.name === 'BlockMapping' ||
          child.name === 'Mapping' ||
          child.name === 'BlockSequence' ||
          child.name === 'Sequence'
        ) {
          targetContainer = child;
          foundInner = true;
          break;
        }
        child = child.nextSibling;
      }
      if (!foundInner) {
        if (targetContainer.firstChild) {
          targetContainer = targetContainer.firstChild;
        } else {
          break;
        }
      }
    }

    const containerName = targetContainer.name;

    if (containerName === 'BlockMapping' || containerName === 'Mapping') {
      let child = targetContainer.firstChild;
      while (child) {
        if (child.name === 'Pair') {
          const keyNode = yamlPositionStrategy.getKeyNodeFromProperty(child);
          if (keyNode && isKeyNodeMatch(keyNode, segment, documentText)) {
            return child;
          }
        }
        child = child.nextSibling;
      }
    }

    if (containerName === 'BlockSequence' || containerName === 'Sequence') {
      const index = parseInt(segment, 10);
      if (!isNaN(index) && index >= 0) {
        let count = 0;
        let child = targetContainer.firstChild;
        while (child) {
          if (child.name === 'SequenceItem') {
            if (count === index) {
              return child.firstChild || child;
            }
            count++;
          } else if (
            child.name !== '[' &&
            child.name !== ']' &&
            child.name !== ',' &&
            child.name !== '-' &&
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

schemaPositionRegistry.register(yamlPositionStrategy);
