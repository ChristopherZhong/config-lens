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

  it('renders version update notice banner when new version is available', async () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    // Initially no banner
    expect(shadow?.querySelector('.version-notice-banner')).toBeNull();

    // Simulate new version detected
    (element as unknown as Record<string, unknown>).newVersionAvailable = true;
    (element as unknown as Record<string, unknown>).latestVersion = '2.0.0';
    await element.updateComplete;

    const banner = shadow?.querySelector('.version-notice-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('v2.0.0');

    const refreshBtn = shadow?.querySelector('.btn-refresh');
    expect(refreshBtn).not.toBeNull();
    expect(refreshBtn?.textContent?.trim()).toBe('Refresh');

    // Click dismiss button
    const dismissBtn = shadow?.querySelector<HTMLButtonElement>('.btn-dismiss');
    expect(dismissBtn).not.toBeNull();
    dismissBtn?.click();
    await element.updateComplete;

    expect(shadow?.querySelector('.version-notice-banner')).toBeNull();
  });
});
