import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('editor-toolbar')
export class EditorToolbar extends LitElement {
  @property({ type: String }) title = 'Editor';
  @state() private copied = false;
  @state() private cleared = false;
  @state() private focusedIndex = 0;

  private copyTimeout?: number;
  private clearTimeout?: number;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .editor-toolbar {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border, #333);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-sidebar, #1e1e1e);
      flex-shrink: 0;
      min-width: 0;
      box-sizing: border-box;
    }

    .editor-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted, #888);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }

    .btn-secondary {
      background: var(--bg-main, #121212);
      color: var(--text-main, #ccc);
      border: 1px solid var(--border, #333);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: var(--bg-card, #252526);
      border-color: var(--accent, #007acc);
    }

    .btn-secondary:active {
      transform: scale(0.97);
    }

    .btn-secondary:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 2px;
    }

    .btn-secondary.copied {
      color: var(--success, #22c55e);
      border-color: var(--success, #22c55e);
      background: rgba(34, 197, 94, 0.1);
    }

    .btn-secondary.cleared {
      color: var(--error, #ef4444);
      border-color: var(--error, #ef4444);
      background: rgba(239, 68, 68, 0.1);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  private handleFoldAll() {
    this.dispatchEvent(new CustomEvent('fold-all', { bubbles: true, composed: true }));
  }

  private handleUnfoldAll() {
    this.dispatchEvent(new CustomEvent('unfold-all', { bubbles: true, composed: true }));
  }

  private handleCopy() {
    this.dispatchEvent(new CustomEvent('copy-content', { bubbles: true, composed: true }));
    this.copied = true;
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    this.copyTimeout = window.setTimeout(() => {
      this.copied = false;
    }, 2000);
  }

  private handleClear() {
    this.dispatchEvent(new CustomEvent('clear-content', { bubbles: true, composed: true }));
    this.cleared = true;
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }
    this.clearTimeout = window.setTimeout(() => {
      this.cleared = false;
    }, 2000);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const buttonCount = 4;
    let newIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (this.focusedIndex + 1) % buttonCount;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (this.focusedIndex - 1 + buttonCount) % buttonCount;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = buttonCount - 1;
    }

    if (newIndex !== -1) {
      e.preventDefault();
      this.focusedIndex = newIndex;
      this.updateComplete.then(() => {
        const buttonIds = ['btn-fold-all', 'btn-unfold-all', 'btn-copy', 'btn-clear'];
        const button = this.shadowRoot?.querySelector<HTMLButtonElement>(`#${buttonIds[newIndex]}`);
        button?.focus();
      });
    }
  }

  render() {
    return html`
      <div
        class="editor-toolbar"
        role="toolbar"
        aria-label="Editor controls"
        @keydown="${this.handleKeyDown}"
      >
        <div class="editor-title">${this.title}</div>
        <div class="toolbar-actions">
          <button
            id="btn-fold-all"
            type="button"
            class="btn-secondary"
            tabindex="${this.focusedIndex === 0 ? 0 : -1}"
            @focus="${() => { this.focusedIndex = 0; }}"
            @click="${this.handleFoldAll}"
            aria-label="Fold All"
            title="Fold all code blocks"
          >
            <span aria-hidden="true">▾</span> Fold All
          </button>
          <button
            id="btn-unfold-all"
            type="button"
            class="btn-secondary"
            tabindex="${this.focusedIndex === 1 ? 0 : -1}"
            @focus="${() => { this.focusedIndex = 1; }}"
            @click="${this.handleUnfoldAll}"
            aria-label="Expand All"
            title="Expand all code blocks"
          >
            <span aria-hidden="true">▸</span> Expand All
          </button>
          <button
            id="btn-copy"
            type="button"
            class="btn-secondary ${this.copied ? 'copied' : ''}"
            tabindex="${this.focusedIndex === 2 ? 0 : -1}"
            @focus="${() => { this.focusedIndex = 2; }}"
            @click="${this.handleCopy}"
            aria-label="${this.copied ? 'Content copied to clipboard' : 'Copy code to clipboard'}"
            title="${this.copied ? 'Copied!' : 'Copy code to clipboard'}"
          >
            <span aria-hidden="true">${this.copied ? '✓' : '📋'}</span> ${this.copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            id="btn-clear"
            type="button"
            class="btn-secondary ${this.cleared ? 'cleared' : ''}"
            tabindex="${this.focusedIndex === 3 ? 0 : -1}"
            @focus="${() => { this.focusedIndex = 3; }}"
            @click="${this.handleClear}"
            aria-label="${this.cleared ? 'Document content cleared' : 'Clear content'}"
            title="${this.cleared ? 'Cleared!' : 'Clear document content'}"
          >
            <span aria-hidden="true">${this.cleared ? '✓' : '🗑️'}</span> ${this.cleared ? 'Cleared!' : 'Clear'}
          </button>
          <span class="sr-only" role="status" aria-live="polite">
            ${this.copied ? 'Content copied to clipboard' : this.cleared ? 'Document content cleared' : ''}
          </span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'editor-toolbar': EditorToolbar;
  }
}
