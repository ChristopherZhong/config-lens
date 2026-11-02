import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { algorithms } from '../algorithms/registry';
import './theme-toggle';
import './algorithm-selector';
import './text-panel';

function isMode(value: unknown): value is 'encode' | 'decode' {
  return value === 'encode' || value === 'decode';
}

function isAlgorithmKey(value: unknown): value is keyof typeof algorithms {
  return typeof value === 'string' && value in algorithms;
}

const DEFAULT_INPUT = '';
const DEFAULT_ALGORITHM = 'base64';
const DEFAULT_MODE = 'encode';

interface AppState {
  input: string;
  algorithm: string;
  mode: 'encode' | 'decode';
}

function getState(getValue: (key: string) => string | null): AppState | null {
  const algorithm = getValue('algorithm');
  const input = getValue('input');
  const mode = getValue('mode');

  if (!isAlgorithmKey(algorithm) || input == null || !isMode(mode)) {
    return null;
  }

  return {
    algorithm,
    input,
    mode,
  };
}

@customElement('decoder-app')
export class DecoderApp extends LitElement {
  @state() private inputText = DEFAULT_INPUT;
  @state() private outputText = '';
  @state() private selectedAlgorithm = DEFAULT_ALGORITHM;
  @state() private mode: 'encode' | 'decode' = DEFAULT_MODE;
  @state() private error = '';

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--bg-main);
      color: var(--text-primary);
      transition:
        background 0.3s ease,
        color 0.3s ease;
      font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
    }
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.25rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-emoji {
      font-size: 2rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--accent-color) 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
      font-weight: 500;
    }
    .panels-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    @media (min-width: 1024px) {
      .panels-grid {
        flex-direction: row;
        align-items: stretch;
      }
    }
    /* Error Banner */
    .error-banner {
      background: var(--bg-error);
      border: 1px solid var(--border-error);
      color: var(--text-error);
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: shake 0.3s ease-in-out;
    }
    @keyframes shake {
      0%,
      100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-4px);
      }
      75% {
        transform: translateX(4px);
      }
    }
    /* Simple clean footer */
    footer {
      text-align: center;
      margin-top: auto;
      padding: 2rem 0;
      font-size: 0.825rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
    }
    footer a {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
    }
    footer a:hover {
      text-decoration: underline;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadState();
  }

  private loadState() {
    const params = new URLSearchParams(window.location.search);
    const urlState = getState((key) => params.get(key));
    const storageState = getState((key) => localStorage.getItem(`devencoder_${key}`));

    if (urlState) {
      this.inputText = urlState.input;
      this.selectedAlgorithm = urlState.algorithm;
      this.mode = urlState.mode;
    } else if (storageState) {
      this.inputText = storageState.input;
      this.selectedAlgorithm = storageState.algorithm;
      this.mode = storageState.mode;
    } else {
      this.inputText = DEFAULT_INPUT;
      this.selectedAlgorithm = DEFAULT_ALGORITHM;
      this.mode = DEFAULT_MODE;
    }

    this.performConversion();
  }

  private saveState() {
    // Save to localStorage
    if (this.inputText) {
      localStorage.setItem('devencoder_input', this.inputText);
    } else {
      localStorage.removeItem('devencoder_input');
    }

    localStorage.setItem('devencoder_algorithm', this.selectedAlgorithm);
    localStorage.setItem('devencoder_mode', this.mode);

    // Save to URL search params
    const params = new URLSearchParams(window.location.search);
    if (this.inputText) {
      params.set('input', this.inputText);
    } else {
      params.delete('input');
    }

    params.set('algorithm', this.selectedAlgorithm);
    params.set('mode', this.mode);

    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }

  private handleTextInput(e: CustomEvent) {
    this.inputText = e.detail.value;
    this.performConversion();
    this.saveState();
  }

  private handleAlgoChanged(e: CustomEvent) {
    this.selectedAlgorithm = e.detail.algorithm;
    this.performConversion();
    this.saveState();
  }

  private handleModeChanged(e: CustomEvent) {
    this.mode = e.detail.mode;
    this.performConversion();
    this.saveState();
  }

  private handleSwapRequested() {
    if (!this.outputText) return;
    const previousOutput = this.outputText;
    this.inputText = previousOutput;
    this.mode = this.mode === 'encode' ? 'decode' : 'encode';
    this.performConversion();
    this.saveState();
  }

  private performConversion() {
    this.error = '';
    if (!this.inputText) {
      this.outputText = '';
      return;
    }
    const algo = algorithms[this.selectedAlgorithm];
    if (!algo) {
      this.error = 'Unknown algorithm selected.';
      this.outputText = '';
      return;
    }
    try {
      if (this.mode === 'encode') {
        this.outputText = algo.encode(this.inputText);
      } else {
        this.outputText = algo.decode(this.inputText);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.outputText = '';
      this.error = message || 'An error occurred during conversion.';
    }
  }

  render() {
    return html`
      <div class="app-container">
        <!-- Header -->
        <header>
          <div class="brand">
            <span class="logo-emoji">⚡</span>
            <div>
              <h1>DevEncoder</h1>
              <p class="subtitle">Secure, fast, client-side decoding & encoding tool</p>
            </div>
          </div>
          <theme-toggle></theme-toggle>
        </header>

        <!-- Controls (Algorithm and Mode Selection) -->
        <algorithm-selector
          .selectedAlgorithm="${this.selectedAlgorithm}"
          .mode="${this.mode}"
          @algo-changed="${this.handleAlgoChanged}"
          @mode-changed="${this.handleModeChanged}"
        ></algorithm-selector>

        <!-- Error Banner -->
        ${
          this.error
            ? html`
                <div class="error-banner">
                  <span>⚠️</span>
                  <span><strong>Error:</strong> ${this.error}</span>
                </div>
              `
            : ''
        }

        <!-- Text Panels Grid -->
        <div class="panels-grid">
          <!-- Input Panel -->
          <text-panel
            title="Input"
            .value="${this.inputText}"
            placeholder="Type or paste your text to convert..."
            .showClear="${true}"
            .showPaste="${true}"
            @text-changed="${this.handleTextInput}"
          ></text-panel>

          <!-- Output Panel -->
          <text-panel
            title="Output"
            .value="${this.outputText}"
            placeholder="Result will appear here..."
            .readonly="${true}"
            .showCopy="${true}"
            .showSwap="${true}"
            @swap-requested="${this.handleSwapRequested}"
          ></text-panel>
        </div>

        <!-- Footer -->
        <footer>
          <p>
            Made with 🤍. All conversions are performed locally in your browser. No data is sent to
            any server.
          </p>
        </footer>
      </div>
    `;
  }
}
