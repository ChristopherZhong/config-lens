export class CalculatorHistory extends HTMLElement {
  private historyList: HTMLDivElement | null = null;

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
            border-radius: 1rem;
            padding: 1rem;
            max-height: 200px;
            overflow-y: auto;
            margin-top: 1rem;
          }
          h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .history-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
          }
          .history-item:last-child {
            border-bottom: none;
          }
          .expr {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }
          .res {
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-primary);
          }
        </style>
        <h3>History</h3>
        <div id="history-list"></div>
      `;
      this.historyList = this.shadowRoot.getElementById('history-list') as HTMLDivElement;
    }
  }

  addEntry(expression: string, result: string) {
    if (this.historyList) {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="expr">${expression}</div>
        <div class="res">= ${result}</div>
      `;
      item.onclick = () => {
        this.dispatchEvent(new CustomEvent('recall-history', {
          detail: { expression, result },
          bubbles: true,
          composed: true
        }));
      };
      this.historyList.prepend(item);
    }
  }

  clearHistory() {
    if (this.historyList) {
      this.historyList.innerHTML = '';
    }
  }
}

customElements.define('calc-history', CalculatorHistory);
