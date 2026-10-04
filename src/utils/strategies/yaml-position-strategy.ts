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

export const yamlPositionStrategy: SchemaPositionStrategy = {
  mode: 'yaml',

  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Pair') {
      const keyNode = propertyNode.getChild('Key');
      if (keyNode) {
        return keyNode.firstChild || keyNode;
      }
      return propertyNode.firstChild;
    }
    return null;
  },

  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Pair') {
      const valNode = propertyNode.getChild('Value');
      if (valNode) {
        return valNode.firstChild || valNode;
      }
      let child = propertyNode.firstChild;
      let pastKey = false;
      while (child) {
        if (pastKey && child.name !== ':' && child.name !== 'Comment') {
          return child;
        }
        if (child.name === 'Key' || child.name === ':') {
          pastKey = true;
        }
        child = child.nextSibling;
      }
      return propertyNode.lastChild;
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
          if (keyNode) {
            const keyText = getNodeText(keyNode, documentText);
            if (keyText === segment) {
              return child;
            }
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
