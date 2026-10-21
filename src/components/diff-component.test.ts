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

  it('renders visual pane headers for Original and Modified documents', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const headers = shadow?.querySelector('.diff-headers');
    expect(headers).not.toBeNull();

    const titles = shadow?.querySelectorAll('.diff-pane-title');
    expect(titles?.length).toBe(2);
    expect(titles?.[0].textContent?.trim()).toBe('Original');
    expect(titles?.[1].textContent?.trim()).toBe('Modified');
  });

  it('configures aria-label attributes on Original and Modified editors', () => {
    const shadow = element.shadowRoot;
    const originalEditor = shadow?.querySelector('[aria-label="Original document content"]');
    const modifiedEditor = shadow?.querySelector('[aria-label="Modified document content"]');

    expect(originalEditor).not.toBeNull();
    expect(modifiedEditor).not.toBeNull();
  });
});
