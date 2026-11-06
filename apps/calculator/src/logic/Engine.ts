export class CalculatorEngine {
  private currentInput: string = '0';
  private expression: string = '';
  private lastResult: string | null = null;
  private memory: number = 0;
  private isDegree: boolean = true;

  processKey(key: string): { display: string; preview: string; historyEntry?: { expression: string; result: string } } {
    if (this.isDigit(key)) {
      this.handleDigit(key);
    } else if (this.isOperator(key)) {
      this.handleOperator(key);
    } else {
      switch (key) {
        case 'clear':
          this.clear();
          break;
        case 'backspace':
          this.backspace();
          break;
        case 'dot':
          this.handleDot();
          break;
        case 'equals':
          return this.calculate();
        case 'percent':
          this.handlePercent();
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'sqrt':
        case 'log':
          this.handleScientific(key);
          break;
        case 'pi':
          this.currentInput = Math.PI.toString();
          this.lastResult = null;
          break;
        case 'e':
          this.currentInput = Math.E.toString();
          this.lastResult = null;
          break;
        case 'm-plus':
          this.memory += parseFloat(this.currentInput);
          this.lastResult = this.currentInput;
          break;
        case 'm-minus':
          this.memory -= parseFloat(this.currentInput);
          this.lastResult = this.currentInput;
          break;
        case 'm-recall':
          this.currentInput = this.memory.toString();
          this.lastResult = this.currentInput;
          break;
        case 'm-clear':
          this.memory = 0;
          break;
        case 'deg-rad':
          this.isDegree = !this.isDegree;
          break;
      }
    }

    return {
      display: this.currentInput,
      preview: this.expression
    };
  }

  private isDigit(key: string): boolean {
    return /^[0-9]$/.test(key);
  }

  private isOperator(key: string): boolean {
    return ['add', 'subtract', 'multiply', 'divide', 'pow'].includes(key);
  }

  private handleDigit(digit: string) {
    if (this.currentInput === '0' || this.lastResult !== null) {
      this.currentInput = digit;
      this.lastResult = null;
    } else {
      this.currentInput += digit;
    }
  }

  private handleOperator(op: string) {
    const opSymbol = this.getOperatorSymbol(op);
    if (this.lastResult !== null) {
      this.expression = this.lastResult + ' ' + opSymbol + ' ';
      this.lastResult = null;
    } else if (this.currentInput !== '') {
      this.expression += this.currentInput + ' ' + opSymbol + ' ';
    }
    this.currentInput = '0';
  }

  private getOperatorSymbol(op: string): string {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      case 'pow': return '^';
      default: return '';
    }
  }

  private handleDot() {
    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
  }

  private handlePercent() {
    this.currentInput = (parseFloat(this.currentInput) / 100).toString();
  }

  private handleScientific(fn: string) {
    let val = parseFloat(this.currentInput);
    if (this.isDegree && ['sin', 'cos', 'tan'].includes(fn)) {
      val = val * (Math.PI / 180);
    }

    let res = 0;
    switch (fn) {
      case 'sin': res = Math.sin(val); break;
      case 'cos': res = Math.cos(val); break;
      case 'tan': res = Math.tan(val); break;
      case 'sqrt': res = Math.sqrt(val); break;
      case 'log': res = Math.log10(val); break;
    }
    this.currentInput = res.toString();
    this.lastResult = this.currentInput; // Set this as last result so next digit replaces it
  }

  private clear() {
    this.currentInput = '0';
    this.expression = '';
    this.lastResult = null;
  }

  private backspace() {
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
    }
  }

  recallValue(value: string) {
    this.currentInput = value;
    this.lastResult = value;
    this.expression = '';
  }

  getMode() {
    return {
      isDegree: this.isDegree,
      hasMemory: this.memory !== 0
    };
  }

  private calculate(): { display: string; preview: string; historyEntry?: { expression: string; result: string } } {
    const fullExpression = this.expression + this.currentInput;
    try {
      // Simple evaluator for the expression string
      const result = this.evaluate(fullExpression);
      const resultStr = result.toString();
      const entry = { expression: fullExpression, result: resultStr };
      this.lastResult = resultStr;
      this.currentInput = resultStr;
      this.expression = '';
      return { display: this.currentInput, preview: '', historyEntry: entry };
    } catch (e) {
      return { display: 'Error', preview: '' };
    }
  }

  private evaluate(expr: string): number {
    // Replace symbols for evaluation
    const sanitizedExpr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
    // Using Function instead of eval for a bit more safety, though still risky with user input.
    // In a production app, use a math library like mathjs.
    return new Function(`return ${sanitizedExpr}`)();
  }
}
