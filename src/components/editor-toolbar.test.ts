import { describe, it, expect, beforeEach } from 'vitest';
import './editor-toolbar';
import type { EditorToolbar } from './editor-toolbar';

describe('EditorToolbar component', () => {
  let element: EditorToolbar;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('editor-toolbar') as EditorToolbar;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders title and action buttons with ARIA toolbar attributes', async () => {
    element.title = 'Test Editor';
    await element.updateComplete;

    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const toolbar = shadow?.querySelector('.editor-toolbar');
    expect(toolbar?.getAttribute('role')).toBe('toolbar');
    expect(toolbar?.getAttribute('aria-label')).toBe('Editor controls');

    const titleEl = shadow?.querySelector('.editor-title');
    expect(titleEl?.textContent).toBe('Test Editor');

    const foldBtn = shadow?.querySelector('button[aria-label="Fold All"]');
    const unfoldBtn = shadow?.querySelector('button[aria-label="Expand All"]');
    const copyBtn = shadow?.querySelector('button[title="Copy code to clipboard"]');

    expect(foldBtn).not.toBeNull();
    expect(foldBtn?.getAttribute('type')).toBe('button');
    expect(unfoldBtn).not.toBeNull();
    expect(unfoldBtn?.getAttribute('type')).toBe('button');
    expect(copyBtn).not.toBeNull();
    expect(copyBtn?.getAttribute('type')).toBe('button');

    const statusLiveRegion = shadow?.querySelector('[role="status"][aria-live="polite"]');
    expect(statusLiveRegion).not.toBeNull();
  });

  it('dispatches fold-all event when Fold All button is clicked', async () => {
    let foldFired = false;
    element.addEventListener('fold-all', () => {
      foldFired = true;
    });

    const foldBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('button[aria-label="Fold All"]');
    foldBtn?.click();

    expect(foldFired).toBe(true);
  });

  it('dispatches unfold-all event when Expand All button is clicked', async () => {
    let unfoldFired = false;
    element.addEventListener('unfold-all', () => {
      unfoldFired = true;
    });

    const unfoldBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('button[aria-label="Expand All"]');
    unfoldBtn?.click();

    expect(unfoldFired).toBe(true);
  });

  it('dispatches copy-content event and shows Copied! feedback when Copy button is clicked', async () => {
    let copyFired = false;
    element.addEventListener('copy-content', () => {
      copyFired = true;
    });

    const copyBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('button[title="Copy code to clipboard"]');
    expect(copyBtn).not.toBeNull();

    copyBtn?.click();
    await element.updateComplete;

    expect(copyFired).toBe(true);
    expect(copyBtn?.textContent).toContain('Copied!');
    expect(copyBtn?.getAttribute('title')).toBe('Copied!');
    expect(copyBtn?.getAttribute('aria-label')).toBe('Content copied to clipboard');
    expect(copyBtn?.classList.contains('copied')).toBe(true);

    const statusEl = element.shadowRoot?.querySelector('[role="status"]');
    expect(statusEl?.textContent?.trim()).toBe('Content copied to clipboard');
  });
});
