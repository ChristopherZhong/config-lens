import { hoverTooltip, Tooltip, EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { fetchSchema, getValidator } from './validation';
import { getKeyNodeFromProperty } from './schema-position';
import { documentParserRegistry } from './document-parser-registry';

export interface HoverSchemaInfo {
  path: string[];
  propertyName: string;
  schema: Record<string, unknown>;
  isRequired?: boolean;
}

export type { DocumentParserStrategy } from './document-parser-strategy';
export {
  DocumentParserRegistry,
  documentParserRegistry
} from './document-parser-registry';
export { jsonParserStrategy } from './strategies/json-parser-strategy';
export { yamlParserStrategy } from './strategies/yaml-parser-strategy';

/**
 * Resolves $ref pointers within a root JSON schema.
 */
export function resolveSchemaRef(rootSchema: unknown, reference: string): Record<string, unknown> | null {
  if (!reference || typeof reference !== 'string') return null;
  if (!reference.startsWith('#/')) return null;

  const parts = reference.slice(2).split('/');
  let current: unknown = rootSchema;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return null;
    const decoded = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (decoded === '__proto__' || decoded === 'constructor' || decoded === 'prototype') {
      return null;
    }
    if (!Object.prototype.hasOwnProperty.call(current, decoded)) {
      return null;
    }
    current = (current as Record<string, unknown>)[decoded];
  }
  return current && typeof current === 'object' && !Array.isArray(current) ? (current as Record<string, unknown>) : null;
}

/**
 * Resolves all $ref references in a sub-schema (or merges them if necessary).
 */
export function dereferenceSchema(rootSchema: unknown, subSchema: unknown): Record<string, unknown> | null {
  if (!subSchema || typeof subSchema !== 'object') return null;

  let result: Record<string, unknown> = { ...(subSchema as Record<string, unknown>) };
  let attempts = 0;

  while (typeof result.$ref === 'string' && attempts < 10) {
    const resolved = resolveSchemaRef(rootSchema, result.$ref);
    if (!resolved || typeof resolved !== 'object') break;
    const { $ref, ...rest } = result;
    result = { ...resolved, ...rest };
    attempts++;
  }

  return result;
}

/**
 * Given a root schema and JSON pointer path, navigates to the sub-schema at that path.
 */
export function getSchemaForPath(rootSchema: unknown, path: string[]): HoverSchemaInfo | null {
  if (!rootSchema || typeof rootSchema !== 'object') return null;

  let current = dereferenceSchema(rootSchema, rootSchema);
  let parentSchema = current;
  let isRequired = false;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    if (!current || typeof current !== 'object') return null;

    parentSchema = current;
    const requiredArray = parentSchema.required;
    isRequired = Array.isArray(requiredArray) && requiredArray.includes(segment);

    let nextSchema: unknown = null;

    if (segment === '__proto__' || segment === 'constructor' || segment === 'prototype') {
      return null;
    }

    // Check properties
    const properties = current.properties;
    if (
      properties &&
      typeof properties === 'object' &&
      !Array.isArray(properties) &&
      Object.prototype.hasOwnProperty.call(properties, segment)
    ) {
      nextSchema = (properties as Record<string, unknown>)[segment];
    }
    // Check patternProperties
    else if (current.patternProperties && typeof current.patternProperties === 'object' && !Array.isArray(current.patternProperties)) {
      const patternProperties = current.patternProperties as Record<string, unknown>;
      for (const pattern of Object.keys(patternProperties)) {
        if (Object.prototype.hasOwnProperty.call(patternProperties, pattern)) {
          try {
            if (new RegExp(pattern).test(segment)) {
              nextSchema = patternProperties[pattern];
              break;
            }
          } catch {}
        }
      }
    }
    // Check additionalProperties
    if (!nextSchema && current.additionalProperties && typeof current.additionalProperties === 'object') {
      nextSchema = current.additionalProperties;
    }
    // Check items (array)
    if (!nextSchema && current.items) {
      if (Array.isArray(current.items) && !isNaN(Number(segment))) {
        nextSchema = current.items[Number(segment)] || current.additionalItems;
      } else if (typeof current.items === 'object') {
        nextSchema = current.items;
      }
    }
    // Check allOf / oneOf / anyOf
    if (!nextSchema) {
      const allOf = Array.isArray(current.allOf) ? current.allOf : [];
      const oneOf = Array.isArray(current.oneOf) ? current.oneOf : [];
      const anyOf = Array.isArray(current.anyOf) ? current.anyOf : [];
      const candidates = [...allOf, ...oneOf, ...anyOf];

      for (const candidate of candidates) {
        const resolvedCandidate = dereferenceSchema(rootSchema, candidate);
        const candidateProperties = resolvedCandidate?.properties;
        if (
          candidateProperties &&
          typeof candidateProperties === 'object' &&
          !Array.isArray(candidateProperties) &&
          Object.prototype.hasOwnProperty.call(candidateProperties, segment)
        ) {
          nextSchema = (candidateProperties as Record<string, unknown>)[segment];
          break;
        }
      }
    }

    if (!nextSchema) {
      return null;
    }

    current = dereferenceSchema(rootSchema, nextSchema);
  }

  if (!current) return null;

  const propertyName = path.length > 0 ? path[path.length - 1] : 'root';
  return {
    path,
    propertyName,
    schema: current,
    isRequired
  };
}

/**
 * Extracts JSON Pointer path from syntax tree at character position `position`.
 */
export function getPathAtPosition(view: EditorView, position: number): { path: string[]; targetNode: SyntaxNode } | null {
  const tree = syntaxTree(view.state);
  let node: SyntaxNode | null = tree.resolveInner(position, -1);

  if (!node) return null;

  const pathSegments: string[] = [];
  let targetNode: SyntaxNode = node;

  let current: SyntaxNode | null = node;
  while (current) {
    if (current.name === 'Property' || current.name === 'Pair') {
      const keyNode = getKeyNodeFromProperty(current);
      if (keyNode) {
        // Optimization: Slice text directly from EditorState instead of allocating
        // a full document string with view.state.doc.toString().
        const raw = view.state.sliceDoc(keyNode.from, keyNode.to).trim();
        const keyText = (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
          ? raw.slice(1, -1)
          : raw;
        if (keyText) {
          pathSegments.unshift(keyText);
        }
      }
    } else if (current.name === 'Array' || current.name === 'BlockSequence' || current.name === 'Sequence') {
      let count = 0;
      let child = current.firstChild;
      let matchedIndex = -1;
      while (child) {
        if (child.from <= position && position <= child.to) {
          if (
            child.name !== '[' &&
            child.name !== ']' &&
            child.name !== ',' &&
            child.name !== '-' &&
            child.name !== 'Comment'
          ) {
            matchedIndex = count;
            break;
          }
        }
        if (
          child.name !== '[' &&
          child.name !== ']' &&
          child.name !== ',' &&
          child.name !== '-' &&
          child.name !== 'Comment'
        ) {
          count++;
        }
        child = child.nextSibling;
      }
      if (matchedIndex >= 0) {
        pathSegments.unshift(String(matchedIndex));
      }
    }
    current = current.parent;
  }

  return { path: pathSegments, targetNode };
}

/**
 * Renders tooltip DOM element for a sub-schema.
 */
export function createHoverTooltipElement(info: HoverSchemaInfo): HTMLElement {
  const containerElement = document.createElement('div');
  containerElement.className = 'cm-schema-tooltip';
  containerElement.style.cssText = `
    padding: 8px 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    max-width: 380px;
    background: var(--bg-sidebar, #1e1e1e);
    color: var(--text-main, #d4d4d4);
    border: 1px solid var(--border, #3c3c3c);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 1000;
  `;

  const { propertyName, schema, isRequired } = info;

  // Header line
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-weight: 600;';

  const titleSpan = document.createElement('span');
  titleSpan.style.cssText = 'color: #569cd6; font-family: monospace; font-size: 13px;';
  titleSpan.textContent = propertyName;
  header.appendChild(titleSpan);

  const typeValue = schema.type;
  const typeText = Array.isArray(typeValue)
    ? typeValue.join(' | ')
    : typeof typeValue === 'string'
    ? typeValue
    : schema.enum
    ? 'enum'
    : 'any';

  const typeBadge = document.createElement('span');
  typeBadge.style.cssText = `
    background: rgba(86, 156, 214, 0.2);
    color: #4ec9b0;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
  `;
  typeBadge.textContent = typeText;
  header.appendChild(typeBadge);

  if (isRequired) {
    const requiredBadge = document.createElement('span');
    requiredBadge.style.cssText = `
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 11px;
    `;
    requiredBadge.textContent = 'Required';
    header.appendChild(requiredBadge);
  }

  containerElement.appendChild(header);

  // Schema title / description
  if (typeof schema.title === 'string') {
    const titleElement = document.createElement('div');
    titleElement.style.cssText = 'font-weight: 600; margin-bottom: 2px; color: #dcdcaa;';
    titleElement.textContent = schema.title;
    containerElement.appendChild(titleElement);
  }

  if (typeof schema.description === 'string') {
    const descriptionElement = document.createElement('div');
    descriptionElement.style.cssText = 'margin-bottom: 6px; white-space: pre-wrap; opacity: 0.9;';
    descriptionElement.textContent = schema.description;
    containerElement.appendChild(descriptionElement);
  }

  // Enum values
  if (Array.isArray(schema.enum)) {
    const enumElement = document.createElement('div');
    enumElement.style.cssText = 'margin-top: 4px; font-size: 11px; opacity: 0.85;';
    enumElement.textContent = `Allowed values: ${schema.enum.map((value: unknown) => JSON.stringify(value)).join(', ')}`;
    containerElement.appendChild(enumElement);
  }

  // Default value
  if (schema.default !== undefined) {
    const defaultElement = document.createElement('div');
    defaultElement.style.cssText = 'margin-top: 4px; font-size: 11px; color: #ce9178; font-family: monospace;';
    defaultElement.textContent = `Default: ${JSON.stringify(schema.default)}`;
    containerElement.appendChild(defaultElement);
  }

  // Constraints (min, max, pattern, etc.)
  const constraints: string[] = [];
  if (schema.minimum !== undefined) constraints.push(`min: ${schema.minimum}`);
  if (schema.maximum !== undefined) constraints.push(`max: ${schema.maximum}`);
  if (schema.minLength !== undefined) constraints.push(`minLength: ${schema.minLength}`);
  if (schema.maxLength !== undefined) constraints.push(`maxLength: ${schema.maxLength}`);
  if (schema.pattern) constraints.push(`pattern: ${schema.pattern}`);
  if (schema.format) constraints.push(`format: ${schema.format}`);

  if (constraints.length > 0) {
    const constraintsElement = document.createElement('div');
    constraintsElement.style.cssText = 'margin-top: 4px; font-size: 11px; opacity: 0.75; font-family: monospace;';
    constraintsElement.textContent = `Constraints: ${constraints.join(', ')}`;
    containerElement.appendChild(constraintsElement);
  }

  return containerElement;
}

/**
 * Creates CodeMirror hoverTooltip extension for JSON Schema property tooltips.
 */
export function schemaHoverExtension(mode: string) {
  return hoverTooltip(async (view: EditorView, position: number): Promise<Tooltip | null> => {
    if (view.state.doc.length === 0) return null;

    // Optimization: Check if position maps to a valid property path segment before
    // extracting schema or allocating document string.
    const pathInfo = getPathAtPosition(view, position);
    if (!pathInfo || pathInfo.path.length === 0) return null;

    const documentText = view.state.doc.toString();
    const schemaUrl = documentParserRegistry.extractSchemaUrl(mode, documentText);
    if (!schemaUrl) return null;

    const validator = await getValidator(schemaUrl);
    const schema = validator?.schema || (await fetchSchema(schemaUrl));
    if (!schema) return null;

    const hoverInfo = getSchemaForPath(schema, pathInfo.path);
    if (!hoverInfo) return null;

    return {
      pos: pathInfo.targetNode.from,
      end: pathInfo.targetNode.to,
      above: true,
      create: () => ({
        dom: createHoverTooltipElement(hoverInfo)
      })
    };
  });
}
