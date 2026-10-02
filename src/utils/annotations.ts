import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

export const annotationTheme = EditorView.theme({
  '.cm-property-annotation': {
    color: 'var(--text-muted, #888)',
    fontStyle: 'italic',
    fontSize: '0.85em',
    paddingLeft: '0.75em',
    opacity: '0.75',
    userSelect: 'none',
    pointerEvents: 'none'
  }
});

export class PropertyInfoWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'cm-property-annotation';
    span.textContent = ` ${this.text}`;
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  eq(other: PropertyInfoWidget): boolean {
    return other.text === this.text;
  }
}

export function computeAnnotations(state: EditorState): DecorationSet {
  const lineAnnotationsMap = new Map<number, string[]>();
  const tree = syntaxTree(state);

  tree.iterate({
    enter: (node) => {
      const name = node.name;

      // JSON Array & YAML Sequence / BlockSequence
      if (name === 'Array' || name === 'BlockSequence' || name === 'Sequence') {
        let count = 0;
        let child = node.node.firstChild;
        while (child) {
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

        const line = state.doc.lineAt(node.from);
        const label = count === 1 ? '1 item' : `${count} items`;
        const list = lineAnnotationsMap.get(line.to) || [];
        list.push(label);
        lineAnnotationsMap.set(line.to, list);
      }

      // JSON Object & YAML Mapping / BlockMapping
      if (name === 'Object' || name === 'BlockMapping' || name === 'Mapping') {
        let count = 0;
        let child = node.node.firstChild;
        while (child) {
          if (
            child.name === 'Property' ||
            child.name === 'Pair' ||
            child.name === 'Key'
          ) {
            count++;
          }
          child = child.nextSibling;
        }

        if (count > 0) {
          const line = state.doc.lineAt(node.from);
          const label = count === 1 ? '1 key' : `${count} keys`;
          const list = lineAnnotationsMap.get(line.to) || [];
          list.push(label);
          lineAnnotationsMap.set(line.to, list);
        }
      }
    },
  });

  const widgets: any[] = [];
  // Sort positions ascending for Decoration.set
  const sortedPositions = Array.from(lineAnnotationsMap.keys()).sort((a, b) => a - b);

  for (const pos of sortedPositions) {
    const labels = lineAnnotationsMap.get(pos)!;
    const combinedText = `// ${labels.join(', ')}`;
    widgets.push(
      Decoration.widget({
        widget: new PropertyInfoWidget(combinedText),
        side: 1,
      }).range(pos)
    );
  }

  return Decoration.set(widgets, true);
}

export const propertyAnnotationsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = computeAnnotations(view.state);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = computeAnnotations(update.state);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);
