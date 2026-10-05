import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('version-notice-banner')
export class VersionNoticeBanner extends LitElement {
  @property({ type: String }) latestVersion: string | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .version-notice-banner {
      background: var(--accent, #007acc);
      color: #ffffff;
      padding: 8px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
      flex-shrink: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    .version-notice-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .version-notice-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-refresh {
      background: #ffffff;
      color: var(--accent, #007acc);
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }

    .btn-refresh:hover {
      background: rgba(255, 255, 255, 0.9);
    }

    .btn-refresh:focus-visible,
    .btn-dismiss:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: 2px;
    }

    .btn-dismiss {
      background: transparent;
      color: #ffffff;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .btn-dismiss:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
    }
  `;

  private handleRefresh() {
    this.dispatchEvent(new CustomEvent('refresh-click', { bubbles: true, composed: true }));
  }

  private handleDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss-click', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="version-notice-banner" role="status" aria-live="polite">
        <div class="version-notice-content">
          <span>🚀 A new version of ConfigLens ${this.latestVersion ? `(v${this.latestVersion})` : ''} is available!</span>
        </div>
        <div class="version-notice-actions">
          <button class="btn-refresh" @click="${this.handleRefresh}" aria-label="Refresh page to update">Refresh</button>
          <button class="btn-dismiss" @click="${this.handleDismiss}" aria-label="Dismiss notice">✕</button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'version-notice-banner': VersionNoticeBanner;
  }
}
