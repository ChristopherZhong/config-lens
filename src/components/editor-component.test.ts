import { describe, it, expect, beforeEach } from 'vitest';
import './editor-component';
import type { EditorComponent } from './editor-component';

describe('EditorComponent', () => {
  let element: EditorComponent;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('editor-component') as EditorComponent;
    element.mode = 'json';
    element.content = '{"key": "value"}';
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('configures accessible aria-label on the CodeMirror content editor', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const editor = shadow?.querySelector('[aria-label="JSON document content editor"]');
    expect(editor).not.toBeNull();
  });

  it('renders placeholder text when document content is empty', async () => {
    element.content = '';
    await element.updateComplete;

    const shadow = element.shadowRoot;
    const placeholderEl = shadow?.querySelector('.cm-placeholder');
    expect(placeholderEl).not.toBeNull();
    expect(placeholderEl?.textContent).toContain('Type or paste JSON content here...');
  });
});
