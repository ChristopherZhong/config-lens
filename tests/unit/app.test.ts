import { describe, it, expect, beforeEach } from 'vitest';
import '~src/main';
import type { ConfigLensApp } from '~src/main';
import type { AppHeader } from '~src/components/app-header';
import type { AppFooter } from '~src/components/app-footer';
import type { VersionNoticeBanner } from '~src/components/version-notice-banner';
import type { EditorToolbar } from '~src/components/editor-toolbar';
import { safeStorageGetItem } from '~src/utils/storage';

describe('ConfigLensApp component', () => {
  let element: ConfigLensApp;

  beforeEach(async () => {
    localStorage.clear();
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

  it('renders footer with Storybook link and release version link', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const appFooter = shadow?.querySelector<AppFooter>('app-footer');
    expect(appFooter).not.toBeNull();

    const storybookLink = appFooter?.shadowRoot?.querySelector('a[href="./storybook/"]');
    expect(storybookLink).not.toBeNull();
    expect(storybookLink?.textContent?.trim()).toBe('Storybook');
    expect(storybookLink?.getAttribute('target')).toBeNull();

    const versionLink = appFooter?.shadowRoot?.querySelector('a[href*="releases/tag/v"]');
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

  it('supports roving tabindex and arrow key navigation on view tabs', async () => {
    const shadow = element.shadowRoot;
    const appHeader = shadow?.querySelector<AppHeader>('app-header');
    expect(appHeader).not.toBeNull();

    const headerShadow = appHeader?.shadowRoot;
    const tabLint = headerShadow?.querySelector<HTMLButtonElement>('#tab-lint');
    const tabCompare = headerShadow?.querySelector<HTMLButtonElement>('#tab-compare');
    const tabsContainer = headerShadow?.querySelector<HTMLDivElement>('.tabs');

    expect(tabLint).not.toBeNull();
    expect(tabCompare).not.toBeNull();
    expect(tabsContainer).not.toBeNull();

    // Active tab (Lint) has tabindex 0, inactive tab (Compare) has tabindex -1
    expect(tabLint?.getAttribute('tabindex')).toBe('0');
    expect(tabCompare?.getAttribute('tabindex')).toBe('-1');

    // Press ArrowRight on tabs container to move to Compare tab
    tabsContainer?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;
    await appHeader?.updateComplete;

    expect(tabLint?.getAttribute('tabindex')).toBe('-1');
    expect(tabCompare?.getAttribute('tabindex')).toBe('0');
    expect(tabCompare?.getAttribute('aria-selected')).toBe('true');

    // Press ArrowLeft to return to Lint tab
    tabsContainer?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await element.updateComplete;
    await appHeader?.updateComplete;

    expect(tabLint?.getAttribute('tabindex')).toBe('0');
    expect(tabCompare?.getAttribute('tabindex')).toBe('-1');
    expect(tabLint?.getAttribute('aria-selected')).toBe('true');
  });

  it('maintains separate localStorage content and modified content for JSON and YAML modes', async () => {
    const appHeader = element.shadowRoot?.querySelector<AppHeader>('app-header');
    expect(appHeader).not.toBeNull();

    // Set JSON content
    const jsonContent = '{"mode": "json-test"}';
    const jsonModified = '{"mode": "json-modified-test"}';
    (element as unknown as { handleContentChange: (e: CustomEvent) => void }).handleContentChange(
      new CustomEvent('content-changed', { detail: { content: jsonContent } })
    );
    (element as unknown as { handleModifiedChange: (e: CustomEvent) => void }).handleModifiedChange(
      new CustomEvent('modified-changed', { detail: { content: jsonModified } })
    );

    expect(safeStorageGetItem('config-lens-content-json')).toBe(jsonContent);
    expect(safeStorageGetItem('config-lens-modified-json')).toBe(jsonModified);

    // Switch to YAML mode
    appHeader?.dispatchEvent(new CustomEvent('mode-change', { detail: { mode: 'yaml' } }));
    await element.updateComplete;

    expect((element as unknown as { mode: string }).mode).toBe('yaml');
    expect(safeStorageGetItem('config-lens-mode')).toBe('yaml');

    // Set YAML content
    const yamlContent = 'mode: yaml-test';
    const yamlModified = 'mode: yaml-modified-test';
    (element as unknown as { handleContentChange: (e: CustomEvent) => void }).handleContentChange(
      new CustomEvent('content-changed', { detail: { content: yamlContent } })
    );
    (element as unknown as { handleModifiedChange: (e: CustomEvent) => void }).handleModifiedChange(
      new CustomEvent('modified-changed', { detail: { content: yamlModified } })
    );

    expect(safeStorageGetItem('config-lens-content-yaml')).toBe(yamlContent);
    expect(safeStorageGetItem('config-lens-modified-yaml')).toBe(yamlModified);

    // Switch back to JSON mode and verify stored JSON content is restored
    appHeader?.dispatchEvent(new CustomEvent('mode-change', { detail: { mode: 'json' } }));
    await element.updateComplete;

    expect((element as unknown as { content: string }).content).toBe(jsonContent);
    expect((element as unknown as { modifiedContent: string }).modifiedContent).toBe(jsonModified);
  });

  it('triggers copy-content event and copies code to clipboard when Copy button is clicked in toolbar', async () => {
    let copiedText = '';
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          copiedText = text;
        }
      },
      configurable: true
    });

    const shadow = element.shadowRoot;
    const toolbar = shadow?.querySelector<EditorToolbar>('editor-toolbar');
    expect(toolbar).not.toBeNull();

    const toolbarShadow = toolbar?.shadowRoot;
    const copyButton = toolbarShadow?.querySelector<HTMLButtonElement>('button[title="Copy code to clipboard"]');
    expect(copyButton).not.toBeNull();

    copyButton?.click();
    await element.updateComplete;
    await toolbar?.updateComplete;

    expect(copiedText).toBe((element as unknown as { content: string }).content);
    expect(copyButton?.textContent).toContain('Copied!');
  });
});
