import { describe, it, expect, beforeEach } from 'vitest';
import './diff-component';
import type { DiffComponent } from './diff-component';

describe('DiffComponent', () => {
  let element: DiffComponent;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('diff-component') as DiffComponent;
    element.original = '{"key": "value1"}';
    element.modified = '{"key": "value2"}';
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders visual pane headers for Original and Modified documents with toggle button', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const headers = shadow?.querySelector('.diff-headers');
    expect(headers).not.toBeNull();

    const titles = shadow?.querySelectorAll('.diff-pane-title');
    expect(titles?.length).toBe(2);
    expect(titles?.[0].textContent?.trim()).toContain('Original');
    expect(titles?.[1].textContent?.trim()).toContain('Modified');

    const toggleBtn = shadow?.querySelector('.toggle-compare-btn');
    expect(toggleBtn).not.toBeNull();
    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
  });

  it('updates aria-expanded attribute on toggle button when compareExpanded changes', async () => {
    const shadow = element.shadowRoot;
    const toggleBtn = shadow?.querySelector('.toggle-compare-btn');

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');

    element.compareExpanded = true;
    await element.updateComplete;

    expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');
  });

  it('dispatches toggle-compare event when collapse button is clicked', async () => {
    let toggled = false;
    element.addEventListener('toggle-compare', () => {
      toggled = true;
    });

    const toggleBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('.toggle-compare-btn');
    toggleBtn?.click();

    expect(toggled).toBe(true);
  });

  it('configures aria-label attributes on Original and Modified editors', () => {
    const shadow = element.shadowRoot;
    const originalEditor = shadow?.querySelector('[aria-label="Original document content"]');
    const modifiedEditor = shadow?.querySelector('[aria-label="Modified document content"]');

    expect(originalEditor).not.toBeNull();
    expect(modifiedEditor).not.toBeNull();
  });

  it('updates compareExpanded property and reconfigures diff highlights', async () => {
    expect(element.compareExpanded).toBe(false);

    element.compareExpanded = true;
    await element.updateComplete;

    expect(element.compareExpanded).toBe(true);

    element.compareExpanded = false;
    await element.updateComplete;

    expect(element.compareExpanded).toBe(false);
  });

  it('scopes diff highlight CSS selectors so diff colors/highlights are transparent when compareExpanded is false', async () => {
    element.compareExpanded = false;
    await element.updateComplete;

    const shadow = element.shadowRoot;
    const styleTags = shadow?.querySelectorAll('style');
    let cssText = '';
    styleTags?.forEach((style) => {
      cssText += style.textContent || '';
    });

    expect(cssText).toContain(':host([compareexpanded]) .cm-merge-a .cm-changedLine');
    expect(cssText).toContain(':host(:not([compareexpanded])) .cm-changedLine');
    expect(cssText).toContain('background-color: transparent !important;');
  });
});
