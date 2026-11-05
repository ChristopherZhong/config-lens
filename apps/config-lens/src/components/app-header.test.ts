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

  it('renders breadcrumb navigation for tools and ConfigLens', async () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const breadcrumb = shadow?.querySelector('breadcrumb-trail');
    expect(breadcrumb).not.toBeNull();
    await breadcrumb?.updateComplete;

    const breadcrumbShadow = breadcrumb?.shadowRoot;
    expect(breadcrumbShadow?.querySelector('a[href="../"]')?.textContent?.trim()).toBe('tools');
    expect(breadcrumbShadow?.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('ConfigLens');
  });

  it('renders the logo as a decorative icon', () => {
    const logo = element.shadowRoot?.querySelector<HTMLImageElement>('.logo-icon');
    expect(logo?.getAttribute('src')).toBe('./favicon.svg');
    expect(logo?.getAttribute('alt')).toBe('');
    expect(logo?.getAttribute('aria-hidden')).toBe('true');
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

  it('ignores global Alt+Shift+F shortcut when isEmpty is true', async () => {
    let formatClicked = false;
    element.addEventListener('format-click', () => {
      formatClicked = true;
    });

    element.isEmpty = true;
    await element.updateComplete;

    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'F',
      altKey: true,
      shiftKey: true,
      bubbles: true,
    }));

    expect(formatClicked).toBe(false);
  });
});
