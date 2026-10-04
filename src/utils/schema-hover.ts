import { hoverTooltip, Tooltip, EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import * as jsYaml from 'js-yaml';
import { fetchSchema } from './validation';
import { getKeyNodeFromProperty, getNodeText } from './schema-position';

export interface HoverSchemaInfo {
  path: string[];
  propertyName: string;
  schema: any;
  isRequired?: boolean;
}

/**
 * Resolves $ref pointers within a root JSON schema.
 */
export function resolveSchemaRef(rootSchema: any, ref: string): any {
  if (!ref || typeof ref !== 'string') return null;
  if (!ref.startsWith('#/')) return null;

  const parts = ref.slice(2).split('/');
  let current = rootSchema;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    const decoded = part.replace(/~1/g, '/').replace(/~0/g, '~');
    current = current[decoded];
  }
  return current;
}

/**
 * Resolves all $ref references in a sub-schema (or merges them if necessary).
 */
export function dereferenceSchema(rootSchema: any, subSchema: any): any {
  if (!subSchema || typeof subSchema !== 'object') return subSchema;

  let result = { ...subSchema };
  let attempts = 0;

  while (result.$ref && attempts < 10) {
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
export function getSchemaForPath(rootSchema: any, path: string[]): HoverSchemaInfo | null {
  if (!rootSchema || typeof rootSchema !== 'object') return null;

  let current = dereferenceSchema(rootSchema, rootSchema);
  let parentSchema = current;
  let isRequired = false;

  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (!current || typeof current !== 'object') return null;

    parentSchema = current;
    isRequired = Array.isArray(parentSchema.required) && parentSchema.required.includes(seg);

    let nextSchema: any = null;

    // Check properties
    if (current.properties && current.properties[seg]) {
      nextSchema = current.properties[seg];
    }
    // Check patternProperties
    else if (current.patternProperties) {
      for (const pattern of Object.keys(current.patternProperties)) {
        try {
          if (new RegExp(pattern).test(seg)) {
            nextSchema = current.patternProperties[pattern];
            break;
          }
        } catch {}
      }
    }
    // Check additionalProperties
    if (!nextSchema && current.additionalProperties && typeof current.additionalProperties === 'object') {
      nextSchema = current.additionalProperties;
    }
    // Check items (array)
    if (!nextSchema && current.items) {
      if (Array.isArray(current.items) && !isNaN(Number(seg))) {
        nextSchema = current.items[Number(seg)] || current.additionalItems;
      } else if (typeof current.items === 'object') {
        nextSchema = current.items;
      }
    }
    // Check allOf / oneOf / anyOf
    if (!nextSchema && (current.allOf || current.oneOf || current.anyOf)) {
      const candidates = [...(current.allOf || []), ...(current.oneOf || []), ...(current.anyOf || [])];
      for (const cand of candidates) {
        const resolvedCand = dereferenceSchema(rootSchema, cand);
        if (resolvedCand?.properties && resolvedCand.properties[seg]) {
          nextSchema = resolvedCand.properties[seg];
          break;
        }
      }
    }

    if (!nextSchema) {
      return null;
    }

    current = dereferenceSchema(rootSchema, nextSchema);
  }

  const propertyName = path.length > 0 ? path[path.length - 1] : 'root';
  return {
    path,
    propertyName,
    schema: current,
    isRequired
  };
}

/**
 * Extracts JSON Pointer path from syntax tree at character position `pos`.
 */
export function getPathAtPosition(view: EditorView, pos: number): { path: string[]; targetNode: SyntaxNode } | null {
  const tree = syntaxTree(view.state);
  const docText = view.state.doc.toString();
  let node: SyntaxNode | null = tree.resolveInner(pos, -1);

  if (!node) return null;

  const pathSegments: string[] = [];
  let targetNode: SyntaxNode = node;

  let current: SyntaxNode | null = node;
  while (current) {
    if (current.name === 'Property' || current.name === 'Pair') {
      const keyNode = getKeyNodeFromProperty(current);
      if (keyNode) {
        const keyText = getNodeText(keyNode, docText);
        if (keyText) {
          pathSegments.unshift(keyText);
        }
      }
    } else if (current.name === 'Array' || current.name === 'BlockSequence' || current.name === 'Sequence') {
      // Find index of item
      let count = 0;
      let child = current.firstChild;
      let matchedIndex = -1;
      while (child) {
        if (child.from <= pos && pos <= child.to) {
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
  const dom = document.createElement('div');
  dom.className = 'cm-schema-tooltip';
  dom.style.cssText = `
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

  const typeText = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type || (schema.enum ? 'enum' : 'any');
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
    const reqBadge = document.createElement('span');
    reqBadge.style.cssText = `
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 11px;
    `;
    reqBadge.textContent = 'Required';
    header.appendChild(reqBadge);
  }

  dom.appendChild(header);

  // Schema title / description
  if (schema.title) {
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'font-weight: 600; margin-bottom: 2px; color: #dcdcaa;';
    titleEl.textContent = schema.title;
    dom.appendChild(titleEl);
  }

  if (schema.description) {
    const descEl = document.createElement('div');
    descEl.style.cssText = 'margin-bottom: 6px; white-space: pre-wrap; opacity: 0.9;';
    descEl.textContent = schema.description;
    dom.appendChild(descEl);
  }

  // Enum values
  if (Array.isArray(schema.enum)) {
    const enumEl = document.createElement('div');
    enumEl.style.cssText = 'margin-top: 4px; font-size: 11px; opacity: 0.85;';
    enumEl.textContent = `Allowed values: ${schema.enum.map((v: any) => JSON.stringify(v)).join(', ')}`;
    dom.appendChild(enumEl);
  }

  // Default value
  if (schema.default !== undefined) {
    const defaultEl = document.createElement('div');
    defaultEl.style.cssText = 'margin-top: 4px; font-size: 11px; color: #ce9178; font-family: monospace;';
    defaultEl.textContent = `Default: ${JSON.stringify(schema.default)}`;
    dom.appendChild(defaultEl);
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
    const constrEl = document.createElement('div');
    constrEl.style.cssText = 'margin-top: 4px; font-size: 11px; opacity: 0.75; font-family: monospace;';
    constrEl.textContent = `Constraints: ${constraints.join(', ')}`;
    dom.appendChild(constrEl);
  }

  return dom;
}

/**
 * Creates CodeMirror hoverTooltip extension for JSON Schema property tooltips.
 */
export function schemaHoverExtension(mode: 'json' | 'yaml') {
  return hoverTooltip(async (view: EditorView, pos: number): Promise<Tooltip | null> => {
    const docText = view.state.doc.toString();
    if (!docText) return null;

    let schemaUrl: string | null = null;
    try {
      if (mode === 'json') {
        const parsed = JSON.parse(docText);
        if (parsed && typeof parsed === 'object' && typeof parsed.$schema === 'string') {
          schemaUrl = parsed.$schema;
        }
      } else {
        const parsed: any = jsYaml.load(docText);
        if (parsed && typeof parsed === 'object' && typeof parsed.$schema === 'string') {
          schemaUrl = parsed.$schema;
        }
      }
    } catch {
      return null;
    }

    if (!schemaUrl) return null;

    const schema = await fetchSchema(schemaUrl);
    if (!schema) return null;

    const pathInfo = getPathAtPosition(view, pos);
    if (!pathInfo || pathInfo.path.length === 0) return null;

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
