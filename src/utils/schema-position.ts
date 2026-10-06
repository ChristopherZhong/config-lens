import { jsonLanguage } from '@codemirror/lang-json';
import { yamlLanguage } from '@codemirror/lang-yaml';
import { SyntaxNode } from '@lezer/common';
import { schemaPositionRegistry } from './schema-position-registry';
import './strategies/json-position-strategy';
import './strategies/yaml-position-strategy';

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
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
  const strategy = schemaPositionRegistry.get('json') || schemaPositionRegistry.get('yaml');
  if (propertyNode.name === 'Property') {
    return schemaPositionRegistry.get('json')?.getKeyNodeFromProperty(propertyNode) || null;
  }
  if (propertyNode.name === 'Pair') {
    return schemaPositionRegistry.get('yaml')?.getKeyNodeFromProperty(propertyNode) || null;
  }
  return strategy ? strategy.getKeyNodeFromProperty(propertyNode) : null;
}

export function getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null {
  if (propertyNode.name === 'Property') {
    return schemaPositionRegistry.get('json')?.getValueNodeFromProperty(propertyNode) || null;
  }
  if (propertyNode.name === 'Pair') {
    return schemaPositionRegistry.get('yaml')?.getValueNodeFromProperty(propertyNode) || null;
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

  const strategy = schemaPositionRegistry.get(mode);
  if (!strategy) {
    return { from: 0, to: Math.min(documentText.length, 1) };
  }

  const segments = parseJsonPointer(instancePath);
  // Optimization: Parse syntax tree directly using language parser instead of
  // instantiating a full CodeMirror EditorState object with extensions for every path lookup.
  const parser = mode === 'json' ? jsonLanguage.parser : yamlLanguage.parser;
  const tree = parser.parse(documentText);

  let current: SyntaxNode = tree.topNode;

  // Walk path segments using position strategy
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const childProperty = strategy.findChildNode(current, segment, documentText);
    if (!childProperty) {
      break;
    }

    if (i === segments.length - 1) {
      current = childProperty;
    } else {
      const valNode = strategy.getValueNodeFromProperty(childProperty);
      current = valNode || childProperty;
    }
  }

  if (current === tree.topNode && segments.length > 0) {
    return { from: 0, to: Math.min(documentText.length, 1) };
  }

  // Handle missing property or key highlighting
  if (current.name === 'Property' || current.name === 'Pair') {
    if (keyword === 'required' && params?.missingProperty) {
      const keyNode = strategy.getKeyNodeFromProperty(current);
      if (keyNode) {
        return { from: keyNode.from, to: keyNode.to };
      }
    } else {
      const valNode = strategy.getValueNodeFromProperty(current);
      if (valNode) {
        return { from: valNode.from, to: valNode.to };
      }
      const keyNode = strategy.getKeyNodeFromProperty(current);
      if (keyNode) {
        return { from: keyNode.from, to: keyNode.to };
      }
    }
  }

  return { from: current.from, to: current.to };
}
