import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

export interface DocumentRange {
  from: number;
  to: number;
}

/**
 * Parses JSON pointer (e.g. "/server/port" or "/items/0") into path segments.
 */
export function parseJsonPointer(pointer: string): string[] {
  if (!pointer || pointer === '/') return [];
  const normalized = pointer.startsWith('/') ? pointer.slice(1) : pointer;
  return normalized.split('/').map((seg) =>
    seg.replace(/~1/g, '/').replace(/~0/g, '~')
  );
}

export function getNodeText(node: SyntaxNode, documentText: string): string {
  const raw = documentText.slice(node.from, node.to).trim();
  // Strip quotes if present
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
  const name = propertyNode.name;
  if (name === 'Property') {
    // JSON property
    const propNameNode = propertyNode.getChild('PropertyName');
    if (propNameNode) return propNameNode;
    const stringNode = propertyNode.getChild('String');
    if (stringNode) return stringNode;
    return propertyNode.firstChild;
  }
  if (name === 'Pair') {
    // YAML Pair
    const keyNode = propertyNode.getChild('Key');
    if (keyNode) {
      return keyNode.firstChild || keyNode;
    }
    return propertyNode.firstChild;
  }
  return null;
}

export function getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
  const name = propertyNode.name;
  if (name === 'Property') {
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
  if (name === 'Pair') {
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
}

/**
 * Finds child syntax node corresponding to a key in object/mapping or index in array/sequence.
 */
function findChildNode(container: SyntaxNode, segment: string, documentText: string): SyntaxNode | null {
  let targetContainer = container;

  // Unwrap wrapper nodes like Stream, Document, JsonText to get to actual Object/BlockMapping or Array/BlockSequence
  while (
    targetContainer.name === 'Stream' ||
    targetContainer.name === 'Document' ||
    targetContainer.name === 'JsonText'
  ) {
    let child = targetContainer.firstChild;
    let foundInner = false;
    while (child) {
      if (
        child.name === 'Object' ||
        child.name === 'BlockMapping' ||
        child.name === 'Mapping' ||
        child.name === 'Array' ||
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

  // Object / Mapping handling
  if (
    containerName === 'Object' ||
    containerName === 'BlockMapping' ||
    containerName === 'Mapping'
  ) {
    let child = targetContainer.firstChild;
    while (child) {
      if (child.name === 'Property' || child.name === 'Pair') {
        const keyNode = getKeyNodeFromProperty(child);
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

  // Array / Sequence handling
  if (
    containerName === 'Array' ||
    containerName === 'BlockSequence' ||
    containerName === 'Sequence'
  ) {
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

/**
 * Maps a JSON Pointer path (instancePath) to document character range ({from, to}).
 */
export function findPositionForPath(
  documentText: string,
  mode: 'json' | 'yaml',
  instancePath: string,
  keyword?: string,
  params?: any
): DocumentRange {
  if (!documentText) return { from: 0, to: 0 };

  const segments = parseJsonPointer(instancePath);
  const extensions = [mode === 'json' ? json() : yaml()];
  const state = EditorState.create({ doc: documentText, extensions });
  const tree = syntaxTree(state);

  let current: SyntaxNode = tree.topNode;

  // Walk path segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const childProperty = findChildNode(current, segment, documentText);
    if (!childProperty) {
      break;
    }

    if (i === segments.length - 1) {
      current = childProperty;
    } else {
      // If we matched a Property/Pair, navigate to its value node for the next segment
      const valNode = getValueNodeFromProperty(childProperty);
      current = valNode || childProperty;
    }
  }

  if (current === tree.topNode && segments.length > 0) {
    return { from: 0, to: Math.min(documentText.length, 1) };
  }

  // Handle missing property or key highlighting
  if (current.name === 'Property' || current.name === 'Pair') {
    if (keyword === 'required' && params?.missingProperty) {
      const keyNode = getKeyNodeFromProperty(current);
      if (keyNode) {
        return { from: keyNode.from, to: keyNode.to };
      }
    } else {
      const valNode = getValueNodeFromProperty(current);
      if (valNode) {
        return { from: valNode.from, to: valNode.to };
      }
      const keyNode = getKeyNodeFromProperty(current);
      if (keyNode) {
        return { from: keyNode.from, to: keyNode.to };
      }
    }
  }

  return { from: current.from, to: current.to };
}
