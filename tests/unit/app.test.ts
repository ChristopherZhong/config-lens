import { describe, it, expect, beforeEach } from 'vitest';
import '~src/main';
import type { LinterApp } from '~src/main';

describe('LinterApp component', () => {
  let element: LinterApp;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('linter-app') as LinterApp;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders footer with release version link', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const versionLink = shadow?.querySelector('footer a');
    expect(versionLink).not.toBeNull();
    expect(versionLink?.textContent?.trim()).toMatch(/^v\d+\.\d+\.\d+/);
    expect(versionLink?.getAttribute('target')).toBe('_blank');
    expect(versionLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(versionLink?.getAttribute('href')).toMatch(/^https:\/\/github\.com\/ChristopherZhong\/linter\/releases\/tag\/v/);
  });
});
