import './Display';
import './Keypad';
import './History';
import { CalculatorEngine } from '../logic/Engine';
import { CalculatorDisplay } from './Display';
import { CalculatorKeypad } from './Keypad';
import { CalculatorHistory } from './History';

export class Calculator extends HTMLElement {
  private engine: CalculatorEngine;
  private display: CalculatorDisplay | null = null;
  private keypad: CalculatorKeypad | null = null;
  private history: CalculatorHistory | null = null;

  constructor() {
    super();
    this.engine = new CalculatorEngine();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.addEventListener('key-press', (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      this.handleInput(customEvent.detail.key);
    });

    this.addEventListener('recall-history', (e: Event) => {
      const customEvent = e as CustomEvent<{ expression: string; result: string }>;
      this.engine.recallValue(customEvent.detail.result);
      this.display?.updateDisplay(customEvent.detail.result);
      this.display?.updatePreview('');
    });

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const keyMap: { [key: string]: string } = {
        'Enter': 'equals',
        '=': 'equals',
        'Escape': 'clear',
        'Backspace': 'backspace',
        '+': 'add',
        '-': 'subtract',
        '*': 'multiply',
        '/': 'divide',
        '%': 'percent',
        '.': 'dot'
      };

      if (e.key >= '0' && e.key <= '9') {
        this.handleInput(e.key);
      } else if (keyMap[e.key]) {
        this.handleInput(keyMap[e.key]);
      }
    });
  }

  private handleInput(key: string) {
    const result = this.engine.processKey(key);
    this.display?.updateDisplay(result.display);
    this.display?.updatePreview(result.preview);
    if (result.historyEntry) {
      this.history?.addEntry(result.historyEntry.expression, result.historyEntry.result);
    }
    this.updateStatus();
  }

  private updateStatus() {
    const mode = this.engine.getMode();
    const degRadBtn = this.keypad?.shadowRoot?.getElementById('deg-rad-btn');
    if (degRadBtn) {
      degRadBtn.textContent = mode.isDegree ? 'DEG' : 'RAD';
    }
  }

  private render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            max-width: 400px;
            margin: 2rem auto;
            background: var(--bg-primary);
            border-radius: 2rem;
            padding: 2rem;
            box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            border: 1px solid var(--border-color);
            transition: background 0.3s ease, border-color 0.3s ease;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
          }
          .controls {
            display: flex;
            gap: 0.5rem;
          }
          .toggle-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 1.2rem;
            padding: 0.25rem;
            transition: transform 0.2s ease;
          }
          .toggle-btn:hover {
            transform: scale(1.1);
          }
        </style>
        <div class="header">
          <div class="title">OmniCalc</div>
          <div class="controls">
            <button class="toggle-btn" id="scientific-toggle" title="Scientific Mode">🔬</button>
            <button class="toggle-btn" id="theme-toggle" title="Toggle Theme">🌓</button>
          </div>
        </div>
        <calc-display id="display"></calc-display>
        <calc-keypad id="keypad"></calc-keypad>
        <calc-history id="history"></calc-history>
      `;

      this.display = this.shadowRoot.getElementById('display') as CalculatorDisplay;
      this.keypad = this.shadowRoot.getElementById('keypad') as CalculatorKeypad;
      this.history = this.shadowRoot.getElementById('history') as CalculatorHistory;

      const scientificToggle = this.shadowRoot.getElementById('scientific-toggle');
      scientificToggle?.addEventListener('click', () => {
        this.keypad?.toggleAttribute('scientific');
      });

      const themeToggle = this.shadowRoot.getElementById('theme-toggle');
      themeToggle?.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-theme');
      });
    }
  }
}

customElements.define('omni-calc', Calculator);
