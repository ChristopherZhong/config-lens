import { describe, it, expect, beforeEach } from 'vitest';
import './breadcrumb';
import type { Breadcrumb } from './breadcrumb';

describe('Breadcrumb component', () => {
  let element: Breadcrumb;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('breadcrumb-trail') as Breadcrumb;
    element.items = [
      { label: 'tools', href: '/' },
      { label: 'ConfigLens', current: true },
    ];
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders linked ancestors and marks the current page accessibly', () => {
    const shadow = element.shadowRoot;
    expect(shadow?.querySelector('nav[aria-label="Breadcrumb"]')).not.toBeNull();
    expect(shadow?.querySelector('a[href="/"]')?.textContent?.trim()).toBe('tools');
    expect(shadow?.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('ConfigLens');
    expect(shadow?.querySelector('.separator')?.getAttribute('aria-hidden')).toBe('true');
  });
});