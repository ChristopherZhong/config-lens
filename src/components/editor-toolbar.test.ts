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
    const clearBtn = shadow?.querySelector('button[aria-label="Clear content"]');

    expect(foldBtn).not.toBeNull();
    expect(foldBtn?.getAttribute('type')).toBe('button');
    expect(unfoldBtn).not.toBeNull();
    expect(unfoldBtn?.getAttribute('type')).toBe('button');
    expect(copyBtn).not.toBeNull();
    expect(copyBtn?.getAttribute('type')).toBe('button');
    expect(clearBtn).not.toBeNull();
    expect(clearBtn?.getAttribute('type')).toBe('button');

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

  it('dispatches clear-content event and shows Cleared! feedback when Clear button is clicked', async () => {
    let clearFired = false;
    element.addEventListener('clear-content', () => {
      clearFired = true;
    });

    const clearBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#btn-clear');
    expect(clearBtn).not.toBeNull();

    clearBtn?.click();
    await element.updateComplete;

    expect(clearFired).toBe(true);
    expect(clearBtn?.textContent).toContain('Cleared!');
    expect(clearBtn?.getAttribute('title')).toBe('Cleared!');
    expect(clearBtn?.getAttribute('aria-label')).toBe('Document content cleared');
    expect(clearBtn?.classList.contains('cleared')).toBe(true);

    const statusEl = element.shadowRoot?.querySelector('[role="status"]');
    expect(statusEl?.textContent?.trim()).toBe('Document content cleared');
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

  it('disables all action buttons when isEmpty is true and updates title tooltips and ARIA labels', async () => {
    element.isEmpty = true;
    await element.updateComplete;

    const foldBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#btn-fold-all');
    const unfoldBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#btn-unfold-all');
    const copyBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#btn-copy');
    const clearBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#btn-clear');

    expect(foldBtn?.hasAttribute('disabled')).toBe(true);
    expect(foldBtn?.getAttribute('title')).toBe('No code to fold');
    expect(foldBtn?.getAttribute('aria-label')).toBe('No code to fold');

    expect(unfoldBtn?.hasAttribute('disabled')).toBe(true);
    expect(unfoldBtn?.getAttribute('title')).toBe('No code to expand');
    expect(unfoldBtn?.getAttribute('aria-label')).toBe('No code to expand');

    expect(copyBtn?.hasAttribute('disabled')).toBe(true);
    expect(copyBtn?.getAttribute('title')).toBe('No content to copy');
    expect(copyBtn?.getAttribute('aria-label')).toBe('No content to copy');

    expect(clearBtn?.hasAttribute('disabled')).toBe(true);
    expect(clearBtn?.getAttribute('title')).toBe('Document is empty');
    expect(clearBtn?.getAttribute('aria-label')).toBe('Document is empty');
  });

  it('supports roving tabindex and keyboard arrow key navigation', async () => {
    const shadow = element.shadowRoot;
    const toolbar = shadow?.querySelector<HTMLDivElement>('.editor-toolbar');
    const foldBtn = shadow?.querySelector<HTMLButtonElement>('#btn-fold-all');
    const unfoldBtn = shadow?.querySelector<HTMLButtonElement>('#btn-unfold-all');
    const copyBtn = shadow?.querySelector<HTMLButtonElement>('#btn-copy');
    const clearBtn = shadow?.querySelector<HTMLButtonElement>('#btn-clear');

    expect(foldBtn?.getAttribute('tabindex')).toBe('0');
    expect(unfoldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(copyBtn?.getAttribute('tabindex')).toBe('-1');
    expect(clearBtn?.getAttribute('tabindex')).toBe('-1');

    // ArrowRight: fold -> unfold
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(foldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(unfoldBtn?.getAttribute('tabindex')).toBe('0');
    expect(copyBtn?.getAttribute('tabindex')).toBe('-1');
    expect(clearBtn?.getAttribute('tabindex')).toBe('-1');

    // ArrowRight: unfold -> copy
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(foldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(unfoldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(copyBtn?.getAttribute('tabindex')).toBe('0');
    expect(clearBtn?.getAttribute('tabindex')).toBe('-1');

    // ArrowRight: copy -> clear
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(foldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(unfoldBtn?.getAttribute('tabindex')).toBe('-1');
    expect(copyBtn?.getAttribute('tabindex')).toBe('-1');
    expect(clearBtn?.getAttribute('tabindex')).toBe('0');

    // ArrowRight (wraps): clear -> fold
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(foldBtn?.getAttribute('tabindex')).toBe('0');

    // ArrowLeft (wraps): fold -> clear
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await element.updateComplete;

    expect(clearBtn?.getAttribute('tabindex')).toBe('0');

    // Home: -> fold
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await element.updateComplete;

    expect(foldBtn?.getAttribute('tabindex')).toBe('0');

    // End: -> clear
    toolbar?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await element.updateComplete;

    expect(clearBtn?.getAttribute('tabindex')).toBe('0');
  });
});
