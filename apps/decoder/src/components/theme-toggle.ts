import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  @property({ type: String }) theme: 'light' | 'dark' = 'dark';

  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    button:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }
    .icon {
      font-size: 1rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    this.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: this.theme } }));
  }

  applyTheme() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }

  render() {
    return html`
      <button @click="${this.toggleTheme}" aria-label="Toggle theme">
        <span class="icon">${this.theme === 'dark' ? '☀️' : '🌙'}</span>
        <span>${this.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    `;
  }
}
