import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './theme-toggle';

@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) activeTab: 'lint' | 'compare' = 'lint';
  @property({ type: String }) mode: 'json' | 'yaml' = 'json';
  @property({ type: String }) theme: 'light' | 'dark' | 'system' = 'system';
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
      display: grid;
      grid-template-columns: 1fr auto 1fr;
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

    .tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-main, #121212);
      padding: 4px;
      border-radius: 8px;
      border: 1px solid var(--border, #333);
      justify-self: center;
    }

    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      min-width: 0;
    }

    .tab {
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-muted, #888);
      border: none;
      background: transparent;
      font-family: inherit;
    }

    .tab.active {
      background: var(--bg-card, #252526);
      color: var(--text-main, #ccc);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .tab:focus-visible,
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
      .tabs {
        padding: 2px;
      }
      .tab {
        padding: 4px 10px;
        font-size: 12px;
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
    }

    button:hover {
      background: var(--accent-hover, #005999);
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

  private handleTabSelect(tab: 'lint' | 'compare') {
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: { tab },
      bubbles: true,
      composed: true
    }));
  }

  private handleTabKeyDown(e: KeyboardEvent) {
    const tabs: ('lint' | 'compare')[] = ['lint', 'compare'];
    const currentIndex = tabs.indexOf(this.activeTab);
    let newIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    }

    if (newIndex !== -1) {
      e.preventDefault();
      const targetTab = tabs[newIndex];
      this.handleTabSelect(targetTab);
      this.updateComplete.then(() => {
        const button = this.shadowRoot?.querySelector<HTMLButtonElement>(`#tab-${targetTab}`);
        button?.focus();
      });
    }
  }

  private handleModeSelect(e: Event) {
    const mode = (e.target as HTMLSelectElement).value as 'json' | 'yaml';
    this.dispatchEvent(new CustomEvent('mode-change', {
      detail: { mode },
      bubbles: true,
      composed: true
    }));
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
            <img src="${this.logoSrc}" alt="ConfigLens Logo" class="logo-icon" />
            <span>ConfigLens</span>
          </div>
        </div>
        <div class="tabs" role="tablist" aria-label="Editor view options" @keydown="${this.handleTabKeyDown}">
          <button
            id="tab-lint"
            class="tab ${this.activeTab === 'lint' ? 'active' : ''}"
            role="tab"
            aria-selected="${this.activeTab === 'lint'}"
            aria-controls="panel-lint"
            tabindex="${this.activeTab === 'lint' ? 0 : -1}"
            @click="${() => this.handleTabSelect('lint')}"
          >
            Lint
          </button>
          <button
            id="tab-compare"
            class="tab ${this.activeTab === 'compare' ? 'active' : ''}"
            role="tab"
            aria-selected="${this.activeTab === 'compare'}"
            aria-controls="panel-compare"
            tabindex="${this.activeTab === 'compare' ? 0 : -1}"
            @click="${() => this.handleTabSelect('compare')}"
          >
            Compare
          </button>
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
              @click="${this.handleFormat}"
              aria-label="Format content"
              title="Format document (re-indent code)"
            >
              Format
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
