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

export const jsonPositionStrategy: SchemaPositionStrategy = {
  mode: 'json',

  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
    if (propertyNode.name === 'Property') {
      const propNameNode = propertyNode.getChild('PropertyName');
      if (propNameNode) return propNameNode;
      const stringNode = propertyNode.getChild('String');
      if (stringNode) return stringNode;
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
          const keyNode = jsonPositionStrategy.getKeyNodeFromProperty(child);
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
