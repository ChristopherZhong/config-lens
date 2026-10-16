import { describe, it, expect, beforeEach } from 'vitest';
import './version-notice-banner';
import type { VersionNoticeBanner } from './version-notice-banner';

describe('VersionNoticeBanner component', () => {
  let element: VersionNoticeBanner;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('version-notice-banner') as VersionNoticeBanner;
    element.latestVersion = '2.0.0';
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders action buttons with type="button" and dispatches events on click', async () => {
    let refreshFired = false;
    let dismissFired = false;

    element.addEventListener('refresh-click', () => {
      refreshFired = true;
    });
    element.addEventListener('dismiss-click', () => {
      dismissFired = true;
    });

    const shadow = element.shadowRoot;
    const refreshBtn = shadow?.querySelector<HTMLButtonElement>('.btn-refresh');
    const dismissBtn = shadow?.querySelector<HTMLButtonElement>('.btn-dismiss');

    expect(refreshBtn).not.toBeNull();
    expect(refreshBtn?.getAttribute('type')).toBe('button');

    expect(dismissBtn).not.toBeNull();
    expect(dismissBtn?.getAttribute('type')).toBe('button');

    refreshBtn?.click();
    expect(refreshFired).toBe(true);

    dismissBtn?.click();
    expect(dismissFired).toBe(true);
  });
});
