export class CalculatorKeypad extends HTMLElement {
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
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
          }
          button {
            border: none;
            background: var(--bg-button);
            color: var(--text-primary);
            padding: 1.25rem 0;
            border-radius: 0.75rem;
            font-size: 1.25rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
          }
          button:hover {
            background: var(--bg-button-hover);
            transform: translateY(-1px);
          }
          button:active {
            transform: translateY(0);
          }
          button.operator {
            color: var(--accent-color);
            font-weight: 600;
          }
          button.equals {
            background: var(--accent-color);
            color: white;
            grid-column: span 2;
          }
          button.equals:hover {
            filter: brightness(1.1);
          }
          button.clear {
            color: #ef4444;
          }
          .scientific {
            display: none;
            grid-column: span 4;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            margin-bottom: 0.75rem;
          }
          :host([scientific]) .scientific {
            display: grid;
          }
        </style>
        <div class="scientific">
          <button data-key="m-plus" aria-label="memory plus">M+</button>
          <button data-key="m-minus" aria-label="memory minus">M-</button>
          <button data-key="m-recall" aria-label="memory recall">MR</button>
          <button data-key="m-clear" aria-label="memory clear">MC</button>
          <button data-key="sin" aria-label="sine">sin</button>
          <button data-key="cos" aria-label="cosine">cos</button>
          <button data-key="tan" aria-label="tangent">tan</button>
          <button data-key="sqrt" aria-label="square root">√</button>
          <button data-key="pow" aria-label="power">xʸ</button>
          <button data-key="log" aria-label="logarithm base 10">log</button>
          <button data-key="pi" aria-label="pi">π</button>
          <button data-key="e" aria-label="Euler's number">e</button>
          <button data-key="deg-rad" id="deg-rad-btn" aria-label="toggle degree and radian">DEG</button>
        </div>
        <button class="clear" data-key="clear" aria-label="clear all">AC</button>
        <button data-key="backspace" aria-label="backspace">⌫</button>
        <button class="operator" data-key="divide" aria-label="divide">÷</button>
        <button class="operator" data-key="multiply" aria-label="multiply">×</button>

        <button data-key="7">7</button>
        <button data-key="8">8</button>
        <button data-key="9">9</button>
        <button class="operator" data-key="subtract" aria-label="subtract">−</button>

        <button data-key="4">4</button>
        <button data-key="5">5</button>
        <button data-key="6">6</button>
        <button class="operator" data-key="add" aria-label="add">+</button>

        <button data-key="1">1</button>
        <button data-key="2">2</button>
        <button data-key="3">3</button>
        <button class="operator" data-key="percent" aria-label="percentage">%</button>

        <button data-key="0">0</button>
        <button data-key="dot" aria-label="decimal point">.</button>
        <button class="equals" data-key="equals" aria-label="equals">=</button>
      `;

      this.shadowRoot.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          const key = button.getAttribute('data-key');
          this.dispatchEvent(new CustomEvent('key-press', {
            detail: { key },
            bubbles: true,
            composed: true
          }));
        });
      });
    }
  }
}

customElements.define('calc-keypad', CalculatorKeypad);
