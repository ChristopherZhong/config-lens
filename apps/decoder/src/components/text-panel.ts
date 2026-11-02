import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('text-panel')
export class TextPanel extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean }) readonly = false;
  @property({ type: Boolean }) showPaste = false;
  @property({ type: Boolean }) showClear = false;
  @property({ type: Boolean }) showCopy = false;
  @property({ type: Boolean }) showSwap = false;

  @state() private feedbackMessage = '';
  @state() private feedbackTimeoutId: number | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0; /* Prevents overflow in flexbox */
    }
    .panel-container {
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      height: 100%;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .panel-title {
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }
    .actions-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-action {
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-action:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }
    .btn-action:active {
      transform: scale(0.97);
    }
    .textarea-wrapper {
      position: relative;
      flex: 1;
      display: flex;
    }
    textarea {
      width: 100%;
      min-height: 250px;
      padding: 1.25rem;
      background: transparent;
      border: none;
      color: var(--text-primary);
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.95rem;
      line-height: 1.6;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
    }
    textarea::placeholder {
      color: var(--text-muted);
    }
    .panel-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.825rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .feedback {
      color: var(--accent-color);
      font-weight: 600;
      font-size: 0.825rem;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  private showFeedback(message: string) {
    if (this.feedbackTimeoutId) {
      window.clearTimeout(this.feedbackTimeoutId);
    }
    this.feedbackMessage = message;
    this.feedbackTimeoutId = window.setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackTimeoutId = null;
    }, 2000);
  }

  private onInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.dispatchEvent(
      new CustomEvent('text-changed', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleClear() {
    this.value = '';
    this.dispatchEvent(
      new CustomEvent('text-changed', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      }),
    );
    this.showFeedback('Cleared!');
  }

  private async handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      this.value = text;
      this.dispatchEvent(
        new CustomEvent('text-changed', {
          detail: { value: text },
          bubbles: true,
          composed: true,
        }),
      );
      this.showFeedback('Pasted!');
    } catch {
      this.showFeedback('Paste failed');
    }
  }

  private async handleCopy() {
    if (!this.value) return;
    try {
      await navigator.clipboard.writeText(this.value);
      this.showFeedback('Copied!');
    } catch {
      this.showFeedback('Copy failed');
    }
  }

  private handleSwap() {
    this.dispatchEvent(
      new CustomEvent('swap-requested', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getCharacterCount() {
    return this.value ? this.value.length : 0;
  }

  private getWordCount() {
    if (!this.value) return 0;
    const trimmed = this.value.trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  }

  render() {
    return html`
      <div class="panel-container">
        <!-- Header -->
        <div class="panel-header">
          <span class="panel-title">${this.title}</span>
          <div class="actions-group">
            ${this.feedbackMessage ? html`<span class="feedback">${this.feedbackMessage}</span>` : ''}
            ${
              this.showPaste
                ? html`
                    <button
                      class="btn-action"
                      @click="${this.handlePaste}"
                      title="Paste from clipboard"
                    >
                      📋 Paste
                    </button>
                  `
                : ''
            }
            ${
              this.showClear
                ? html`
                    <button class="btn-action" @click="${this.handleClear}" title="Clear text">
                      🧹 Clear
                    </button>
                  `
                : ''
            }
            ${
              this.showCopy
                ? html`
                    <button
                      class="btn-action"
                      @click="${this.handleCopy}"
                      ?disabled="${!this.value}"
                      title="Copy to clipboard"
                    >
                      ✂️ Copy
                    </button>
                  `
                : ''
            }
            ${
              this.showSwap
                ? html`
                    <button
                      class="btn-action"
                      @click="${this.handleSwap}"
                      ?disabled="${!this.value}"
                      title="Swap Input and Output"
                    >
                      🔄 Swap
                    </button>
                  `
                : ''
            }
          </div>
        </div>

        <!-- Text Area -->
        <div class="textarea-wrapper">
          <textarea
            .value="${this.value}"
            placeholder="${this.placeholder}"
            ?readonly="${this.readonly}"
            @input="${this.onInput}"
            aria-label="${this.title}"
          ></textarea>
        </div>

        <!-- Footer Stats -->
        <div class="panel-footer">
          <span>${this.getCharacterCount()} characters</span>
          <span>${this.getWordCount()} words</span>
        </div>
      </div>
    `;
  }
}
