import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-footer')
export class AppFooter extends LitElement {
  @property({ type: String }) status = 'Ready';
  @property({ type: String }) encoding = 'UTF-8';
  @property({ type: String }) version = '1.0.0';

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    footer {
      height: 32px;
      border-top: 1px solid var(--border, #333);
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted, #888);
      background: var(--bg-sidebar, #1e1e1e);
      flex-shrink: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }

    footer a {
      color: var(--text-muted, #888);
      text-decoration: none;
      transition: color 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    footer a:hover {
      color: var(--accent, #007acc);
      text-decoration: underline;
    }

    footer a:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 2px;
    }

    .external-icon {
      width: 10px;
      height: 10px;
      fill: currentColor;
      flex-shrink: 0;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `;

  render() {
    const externalIcon = html`
      <svg class="external-icon" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3.5 2C3.22386 2 3 2.22386 3 2.5C3 2.77614 3.22386 3 3.5 3H8.29289L2.14645 9.14645C1.95118 9.34171 1.95118 9.65829 2.14645 9.85355C2.34171 10.0488 2.65829 10.0488 2.85355 9.85355L9 3.70711V8.5C9 8.77614 9.22386 9 9.5 9C9.77614 9 10 8.77614 10 8.5V2.5C10 2.22386 9.77614 2 9.5 2H3.5Z"/>
      </svg>
    `;

    return html`
      <footer>
        <div role="status">${this.status}</div>
        <div class="footer-right">
          <a
            href="./storybook/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Storybook component library (opens in new tab)"
            title="View Storybook component library (opens in new tab)"
          >Storybook ${externalIcon}</a>
          <span>•</span>
          <div>${this.encoding}</div>
          <span>•</span>
          <a
            href="https://github.com/ChristopherZhong/config-lens/releases/tag/v${this.version}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Version v${this.version} (opens in new tab)"
            title="View release notes on GitHub (opens in new tab)"
          >v${this.version} ${externalIcon}</a>
        </div>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-footer': AppFooter;
  }
}
