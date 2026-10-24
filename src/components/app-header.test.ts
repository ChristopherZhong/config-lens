import { describe, it, expect, beforeEach } from 'vitest';
import './app-header';
import type { AppHeader } from './app-header';

describe('AppHeader component', () => {
  let element: AppHeader;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('app-header') as AppHeader;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders logo icon marked decorative with empty alt and aria-hidden', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const logoImg = shadow?.querySelector('.logo img');
    expect(logoImg).not.toBeNull();
    expect(logoImg?.getAttribute('aria-hidden')).toBe('true');
    expect(logoImg?.getAttribute('alt')).toBe('');
  });

  it('renders format button with type="button", aria-keyshortcuts, and handles format-click event', async () => {
    let formatClicked = false;
    element.addEventListener('format-click', () => {
      formatClicked = true;
    });

    const shadow = element.shadowRoot;
    const formatBtn = shadow?.querySelector<HTMLButtonElement>('button[aria-label="Format content"]');
    expect(formatBtn).not.toBeNull();
    expect(formatBtn?.getAttribute('type')).toBe('button');
    expect(formatBtn?.getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+F');

    formatBtn?.click();
    expect(formatClicked).toBe(true);
  });

  it('disables format button and updates aria-label and title when isEmpty is true', async () => {
    element.isEmpty = true;
    await element.updateComplete;

    const shadow = element.shadowRoot;
    const formatBtn = shadow?.querySelector<HTMLButtonElement>('button[aria-label="No content to format"]');
    expect(formatBtn).not.toBeNull();
    expect(formatBtn?.disabled).toBe(true);
    expect(formatBtn?.getAttribute('title')).toBe('No content to format');
  });
});
