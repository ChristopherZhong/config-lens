import { describe, it, expect, beforeEach } from 'vitest';
import '~src/main';
import type { ConfigLensApp } from '~src/main';

describe('ConfigLensApp component', () => {
  let element: ConfigLensApp;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('config-lens-app') as ConfigLensApp;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders header with controls and responsive flex layout', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const header = shadow?.querySelector('header');
    expect(header).not.toBeNull();
    const logo = shadow?.querySelector('.logo');
    expect(logo).not.toBeNull();
    const tabs = shadow?.querySelector('.tabs');
    expect(tabs).not.toBeNull();
    const controls = shadow?.querySelector('.controls');
    expect(controls).not.toBeNull();
  });

  it('renders footer with release version link', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const versionLink = shadow?.querySelector('footer a');
    expect(versionLink).not.toBeNull();
    expect(versionLink?.textContent?.trim()).toMatch(/^v\d+\.\d+\.\d+/);
    expect(versionLink?.getAttribute('target')).toBe('_blank');
    expect(versionLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(versionLink?.getAttribute('href')).toMatch(/^https:\/\/github\.com\/ChristopherZhong\/config-lens\/releases\/tag\/v/);
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

  it('displays format status feedback when clicking Format button', async () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const formatBtn = shadow?.querySelector<HTMLButtonElement>('button[aria-label="Format content"]');
    expect(formatBtn).not.toBeNull();

    // Valid JSON format feedback
    formatBtn?.click();
    await element.updateComplete;

    let feedback = shadow?.querySelector('.format-feedback');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent?.trim()).toBe('Formatted!');
    expect(feedback?.classList.contains('success')).toBe(true);

    // Invalid JSON format feedback
    (element as unknown as { content: string }).content = '{ invalid json ';
    formatBtn?.click();
    await element.updateComplete;

    feedback = shadow?.querySelector('.format-feedback');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent?.trim()).toBe('Invalid syntax');
    expect(feedback?.classList.contains('error')).toBe(true);
  });
});
