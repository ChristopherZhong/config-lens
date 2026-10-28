import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './theme-toggle';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) activeTab: 'lint' | 'compare' = 'lint';
  @property({ type: String }) mode: 'json' | 'yaml' = 'json';
  @property({ type: String }) theme: 'light' | 'dark' | 'system' = 'system';
  @property({ type: Boolean }) isEmpty = false;
  @property({ type: Object }) formatFeedback: { type: 'success' | 'error'; message: string } | null = null;
  @property({ type: String }) logoSrc = './favicon.svg';

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    header {
      min-height: 56px;
      height: auto;
      border-bottom: 1px solid var(--border, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 24px;
      background-color: var(--bg-sidebar, #1e1e1e);
      flex-shrink: 0;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      min-width: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 18px;
      letter-spacing: -0.02em;
      flex-shrink: 0;
    }

    .logo-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      object-fit: contain;
    }

    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      min-width: 0;
    }

    button:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 2px;
    }

    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
      min-width: 0;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      header {
        padding: 8px 12px;
        gap: 8px;
      }
      .header-right {
        gap: 8px;
      }
      .controls {
        gap: 8px;
      }
    }

    button {
      background: var(--accent, #007acc);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .shortcut-hint {
      display: inline-block;
      font-size: 10px;
      font-family: inherit;
      background: rgba(255, 255, 255, 0.2);
      padding: 1px 4px;
      border-radius: 4px;
      font-weight: 500;
      line-height: 1.2;
    }

    button:hover {
      background: var(--accent-hover, #005999);
    }

    button:active {
      transform: scale(0.98);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--accent, #007acc);
    }

    .format-feedback {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      align-self: center;
      white-space: nowrap;
    }

    .format-feedback.success {
      background: rgba(34, 197, 94, 0.15);
      color: var(--success, #22c55e);
    }

    .format-feedback.error {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error, #ef4444);
    }

    select {
      background: var(--bg-main, #121212);
      color: var(--text-main, #ccc);
      border: 1px solid var(--border, #333);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
    }
  `;


  private handleModeSelect(e: Event) {
    const mode = (e.target as HTMLSelectElement).value as 'json' | 'yaml';
    this.dispatchEvent(new CustomEvent('mode-change', {
      detail: { mode },
      bubbles: true,
      composed: true
    }));
  }

  private handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      this.handleFormat();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  private handleFormat() {
    this.dispatchEvent(new CustomEvent('format-click', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <header>
        <div class="header-left">
          <div class="logo">
            <img src="${this.logoSrc}" alt="" aria-hidden="true" class="logo-icon" />
            <span>ConfigLens</span>
          </div>
        </div>
        <div class="header-right">
          ${this.formatFeedback ? html`
            <span
              class="format-feedback ${this.formatFeedback.type}"
              role="status"
              aria-live="polite"
            >
              ${this.formatFeedback.message}
            </span>
          ` : ''}
          <div class="controls">
            <select
              @change="${this.handleModeSelect}"
              .value="${this.mode}"
              aria-label="Select language mode"
              title="Select language mode"
            >
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
            </select>
            <button
              type="button"
              ?disabled="${this.isEmpty}"
              @click="${this.handleFormat}"
              aria-label="${this.isEmpty ? 'No content to format' : 'Format content'}"
              aria-keyshortcuts="Alt+Shift+F"
              title="${this.isEmpty ? 'No content to format' : 'Format document (Alt+Shift+F)'}"
            >
              Format <kbd class="shortcut-hint" aria-hidden="true">Alt+Shift+F</kbd>
            </button>

            <theme-toggle
              .theme="${this.theme}"
            ></theme-toggle>
          </div>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-header': AppHeader;
  }
}
