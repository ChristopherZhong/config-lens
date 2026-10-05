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
    }

    footer a:hover {
      color: var(--accent, #007acc);
      text-decoration: underline;
    }

    footer a:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 2px;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `;

  render() {
    return html`
      <footer>
        <div>${this.status}</div>
        <div class="footer-right">
          <div>${this.encoding}</div>
          <span>•</span>
          <a
            href="https://github.com/ChristopherZhong/config-lens/releases/tag/v${this.version}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Version v${this.version}"
          >v${this.version}</a>
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
