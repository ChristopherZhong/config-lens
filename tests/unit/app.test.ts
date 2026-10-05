import { describe, it, expect, beforeEach } from 'vitest';
import '~src/main';
import type { ConfigLensApp } from '~src/main';
import type { AppHeader } from '~src/components/app-header';
import type { AppFooter } from '~src/components/app-footer';
import type { VersionNoticeBanner } from '~src/components/version-notice-banner';

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

    const appHeader = shadow?.querySelector<AppHeader>('app-header');
    expect(appHeader).not.toBeNull();

    const headerShadow = appHeader?.shadowRoot;
    expect(headerShadow).not.toBeNull();

    const header = headerShadow?.querySelector('header');
    expect(header).not.toBeNull();
    const logo = headerShadow?.querySelector('.logo');
    expect(logo).not.toBeNull();
    const tabs = headerShadow?.querySelector('.tabs');
    expect(tabs).not.toBeNull();
    const controls = headerShadow?.querySelector('.controls');
    expect(controls).not.toBeNull();
  });

  it('renders footer with release version link', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const appFooter = shadow?.querySelector<AppFooter>('app-footer');
    expect(appFooter).not.toBeNull();

    const versionLink = appFooter?.shadowRoot?.querySelector('footer a');
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
    expect(shadow?.querySelector('version-notice-banner')).toBeNull();

    // Simulate new version detected
    (element as unknown as Record<string, unknown>).newVersionAvailable = true;
    (element as unknown as Record<string, unknown>).latestVersion = '2.0.0';
    await element.updateComplete;

    const bannerComp = shadow?.querySelector<VersionNoticeBanner>('version-notice-banner');
    expect(bannerComp).not.toBeNull();

    const bannerShadow = bannerComp?.shadowRoot;
    const banner = bannerShadow?.querySelector('.version-notice-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('v2.0.0');

    const refreshBtn = bannerShadow?.querySelector('.btn-refresh');
    expect(refreshBtn).not.toBeNull();
    expect(refreshBtn?.textContent?.trim()).toBe('Refresh');

    // Click dismiss button
    const dismissBtn = bannerShadow?.querySelector<HTMLButtonElement>('.btn-dismiss');
    expect(dismissBtn).not.toBeNull();
    dismissBtn?.click();
    await element.updateComplete;

    expect(shadow?.querySelector('version-notice-banner')).toBeNull();
  });

  it('displays format status feedback when clicking Format button', async () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const appHeader = shadow?.querySelector<AppHeader>('app-header');
    expect(appHeader).not.toBeNull();

    const headerShadow = appHeader?.shadowRoot;
    const formatBtn = headerShadow?.querySelector<HTMLButtonElement>('button[aria-label="Format content"]');
    expect(formatBtn).not.toBeNull();

    // Valid JSON format feedback
    formatBtn?.click();
    await element.updateComplete;
    await appHeader?.updateComplete;

    let feedback = headerShadow?.querySelector('.format-feedback');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent?.trim()).toBe('Formatted!');
    expect(feedback?.classList.contains('success')).toBe(true);

    // Invalid JSON format feedback
    (element as unknown as { content: string }).content = '{ invalid json ';
    formatBtn?.click();
    await element.updateComplete;
    await appHeader?.updateComplete;

    feedback = headerShadow?.querySelector('.format-feedback');
    expect(feedback).not.toBeNull();
    expect(feedback?.textContent?.trim()).toBe('Invalid syntax');
    expect(feedback?.classList.contains('error')).toBe(true);
  });
});
