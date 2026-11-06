export class CalculatorDisplay extends HTMLElement {
  private displayElement: HTMLDivElement | null = null;
  private previewElement: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 1rem;
            text-align: right;
            margin-bottom: 1rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
          }
          .preview {
            font-size: 0.9rem;
            color: var(--text-secondary);
            min-height: 1.2rem;
            margin-bottom: 0.5rem;
            word-break: break-all;
          }
          .main-display {
            font-size: 2.5rem;
            font-weight: 600;
            color: var(--text-primary);
            word-break: break-all;
            line-height: 1;
          }
        </style>
        <div class="preview" id="preview"></div>
        <div class="main-display" id="display">0</div>
      `;
      this.displayElement = this.shadowRoot.getElementById('display') as HTMLDivElement;
      this.previewElement = this.shadowRoot.getElementById('preview') as HTMLDivElement;
    }
  }

  updateDisplay(value: string) {
    if (this.displayElement) {
      this.displayElement.textContent = value || '0';
    }
  }

  updatePreview(value: string) {
    if (this.previewElement) {
      this.previewElement.textContent = value;
    }
  }
}

customElements.define('calc-display', CalculatorDisplay);
