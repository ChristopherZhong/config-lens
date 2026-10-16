import { describe, it, expect, beforeEach } from 'vitest';
import './app-footer';
import type { AppFooter } from './app-footer';

describe('AppFooter component', () => {
  let element: AppFooter;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('app-footer') as AppFooter;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders status container with role="status"', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const statusDiv = shadow?.querySelector('div[role="status"]');
    expect(statusDiv).not.toBeNull();
    expect(statusDiv?.textContent?.trim()).toBe('Ready');
  });

  it('renders external release link with open in new tab accessible context', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const releaseLink = shadow?.querySelector<HTMLAnchorElement>('a[target="_blank"]');
    expect(releaseLink).not.toBeNull();
    expect(releaseLink?.getAttribute('aria-label')).toContain('opens in new tab');
    expect(releaseLink?.getAttribute('title')).toContain('opens in new tab');
  });
});
