import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('algorithm-selector')
export class AlgorithmSelector extends LitElement {
  @property({ type: String }) selectedAlgorithm = 'base64';
  @property({ type: String }) mode: 'encode' | 'decode' = 'encode';

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .selector-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      border-radius: 0.75rem;
    }
    @media (min-width: 640px) {
      .selector-container {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    select {
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.625rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-family: inherit;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s ease;
    }
    select:focus {
      border-color: var(--accent-color);
    }
    /* Segmented Control for Mode */
    .segmented-control {
      display: flex;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      padding: 0.25rem;
    }
    .segment-btn {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .segment-btn.active {
      background: var(--accent-color);
      color: #ffffff;
    }
    .segment-btn:not(.active):hover {
      color: var(--text-primary);
    }
  `;

  private onAlgoChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.selectedAlgorithm = select.value;
    this.dispatchEvent(
      new CustomEvent('algo-changed', {
        detail: { algorithm: this.selectedAlgorithm },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private setMode(mode: 'encode' | 'decode') {
    this.mode = mode;
    this.dispatchEvent(
      new CustomEvent('mode-changed', {
        detail: { mode: this.mode },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="selector-container">
        <!-- Algorithm Dropdown -->
        <div class="control-group">
          <label for="algo-select">Select Algorithm</label>
          <select
            id="algo-select"
            .value="${this.selectedAlgorithm}"
            @change="${this.onAlgoChange}"
          >
            <option value="base64">Base64</option>
            <option value="url">URL Percent Encoding</option>
            <option value="hex">Hexadecimal</option>
            <option value="rot13">ROT13</option>
          </select>
        </div>

        <!-- Mode Toggle Segmented Control -->
        <div class="control-group">
          <label>Mode</label>
          <div class="segmented-control">
            <button
              class="segment-btn ${this.mode === 'encode' ? 'active' : ''}"
              @click="${() => this.setMode('encode')}"
            >
              Encode
            </button>
            <button
              class="segment-btn ${this.mode === 'decode' ? 'active' : ''}"
              @click="${() => this.setMode('decode')}"
            >
              Decode
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
