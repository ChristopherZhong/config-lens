import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { computeAnnotations, PropertyInfoWidget, propertyAnnotationsPlugin, annotationTheme } from '../../src/utils/annotations';
import { MergeView } from '@codemirror/merge';

describe('propertyAnnotations', () => {
  it('creates PropertyInfoWidget DOM element correctly', () => {
    const widget = new PropertyInfoWidget('// 3 items');
    const dom = widget.toDOM();
    expect(dom.tagName.toLowerCase()).toBe('span');
    expect(dom.className).toBe('cm-property-annotation');
    expect(dom.textContent).toBe(' // 3 items');
    expect(dom.getAttribute('aria-hidden')).toBe('true');

    const equalWidget = new PropertyInfoWidget('// 3 items');
    const differentWidget = new PropertyInfoWidget('// 2 keys');
    expect(widget.eq(equalWidget)).toBe(true);
    expect(widget.eq(differentWidget)).toBe(false);
  });

  it('computes array items and object keys for JSON', () => {
    const jsonContent = `{
  "items": [1, 2, 3],
  "user": {
    "name": "Alice",
    "role": "Admin"
  }
}`;
    const state = EditorState.create({
      doc: jsonContent,
      extensions: [json()],
    });

    const decorations = computeAnnotations(state);
    expect(decorations).toBeDefined();

    const result: string[] = [];
    const iter = decorations.iter();
    while (iter.value) {
      result.push((iter.value.spec.widget as any).text);
      iter.next();
    }

    expect(result).toContain('// 2 keys');
    expect(result).toContain('// 3 items');
  });

  it('computes annotations for nested structures on same line', () => {
    const jsonContent = `{ "data": [1, 2] }`;
    const state = EditorState.create({
      doc: jsonContent,
      extensions: [json()],
    });

    const decorations = computeAnnotations(state);
    const result: string[] = [];
    const iter = decorations.iter();
    while (iter.value) {
      result.push((iter.value.spec.widget as any).text);
      iter.next();
    }

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toContain('key');
    expect(result[0]).toContain('items');
  });

  it('computes sequence items and mapping keys for YAML', () => {
    const yamlContent = `items:
  - apple
  - banana
  - cherry
user:
  name: Alice
  role: Admin
`;
    const state = EditorState.create({
      doc: yamlContent,
      extensions: [yaml()],
    });

    const decorations = computeAnnotations(state);
    const result: string[] = [];
    const iter = decorations.iter();
    while (iter.value) {
      result.push((iter.value.spec.widget as any).text);
      iter.next();
    }

    expect(result.length).toBeGreaterThan(0);
  });

  it('works within MergeView for both original and modified states', () => {
    const originalContent = '{\n  "items": [1, 2]\n}';
    const modifiedContent = '{\n  "items": [1, 2, 3, 4]\n}';

    const container = document.createElement('div');
    const mergeView = new MergeView({
      a: {
        doc: originalContent,
        extensions: [json(), propertyAnnotationsPlugin, annotationTheme]
      },
      b: {
        doc: modifiedContent,
        extensions: [json(), propertyAnnotationsPlugin, annotationTheme]
      },
      parent: container
    });

    const decsA = computeAnnotations(mergeView.a.state);
    const decsB = computeAnnotations(mergeView.b.state);

    const resultA: string[] = [];
    const iterA = decsA.iter();
    while (iterA.value) {
      resultA.push((iterA.value.spec.widget as any).text);
      iterA.next();
    }

    const resultB: string[] = [];
    const iterB = decsB.iter();
    while (iterB.value) {
      resultB.push((iterB.value.spec.widget as any).text);
      iterB.next();
    }

    expect(resultA).toContain('// 2 items');
    expect(resultB).toContain('// 4 items');
  });
});
