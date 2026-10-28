import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('theme-toggle')
export class ThemeToggle extends LitElement {
  @property({ type: String }) theme: 'light' | 'dark' | 'system' = 'system';

  static styles = css`
    :host {
      display: inline-block;
    }

    .theme-toggle {
      display: flex;
      background: var(--bg-sidebar, #1e1e1e);
      border: 1px solid var(--border, #333);
      border-radius: 8px;
      padding: 2px;
      position: relative;
      height: 32px;
      box-sizing: border-box;
    }

    .theme-slider {
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 2px;
      width: calc((100% - 4px) / 3);
      background: var(--bg-card, #252526);
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
      border: 1px solid var(--border, #333);
      transition: transform 0.2s ease;
      z-index: 0;
    }

    .theme-toggle[data-theme="light"] .theme-slider {
      transform: translateX(100%);
    }

    .theme-toggle[data-theme="dark"] .theme-slider {
      transform: translateX(200%);
    }

    .theme-option {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted, #888);
      font-size: 14px;
      cursor: pointer;
      z-index: 1;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      width: 32px;
      opacity: 0.5;
    }

    .theme-option:hover {
      background: transparent;
      color: var(--text-main, #ccc);
      opacity: 0.8;
    }

    .theme-option.active {
      color: var(--text-main, #ccc);
      opacity: 1;
    }

    .theme-option:focus-visible {
      outline: 2px solid var(--accent, #007acc);
      outline-offset: 2px;
      border-radius: 4px;
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

  private selectTheme(newTheme: 'light' | 'dark' | 'system') {
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: newTheme },
      bubbles: true,
      composed: true
    }));
  }

  private handleKeyDown(e: KeyboardEvent) {
    const themes: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.theme);
    let newIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = (currentIndex + 1) % themes.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = (currentIndex - 1 + themes.length) % themes.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = themes.length - 1;
    }

    if (newIndex !== -1) {
      e.preventDefault();
      const targetTheme = themes[newIndex];
      this.selectTheme(targetTheme);
      this.updateComplete.then(() => {
        const button = this.shadowRoot?.querySelector<HTMLButtonElement>(`#theme-option-${targetTheme}`);
        button?.focus();
      });
    }
  }

  render() {
    return html`
      <div
        class="theme-toggle"
        data-theme="${this.theme}"
        role="radiogroup"
        aria-label="Select theme"
        @keydown="${this.handleKeyDown}"
      >
        <div class="theme-slider"></div>
        <button
          id="theme-option-system"
          class="theme-option ${this.theme === 'system' ? 'active' : ''}"
          @click="${() => this.selectTheme('system')}"
          role="radio"
          aria-checked="${this.theme === 'system'}"
          tabindex="${this.theme === 'system' ? 0 : -1}"
          title="System Theme"
          aria-label="System Theme"
        >
          🖥️
        </button>
        <button
          id="theme-option-light"
          class="theme-option ${this.theme === 'light' ? 'active' : ''}"
          @click="${() => this.selectTheme('light')}"
          role="radio"
          aria-checked="${this.theme === 'light'}"
          tabindex="${this.theme === 'light' ? 0 : -1}"
          title="Light Theme"
          aria-label="Light Theme"
        >
          ☀️
        </button>
        <button
          id="theme-option-dark"
          class="theme-option ${this.theme === 'dark' ? 'active' : ''}"
          @click="${() => this.selectTheme('dark')}"
          role="radio"
          aria-checked="${this.theme === 'dark'}"
          tabindex="${this.theme === 'dark' ? 0 : -1}"
          title="Dark Theme"
          aria-label="Dark Theme"
        >
          🌙
        </button>
        <span class="sr-only" role="status" aria-live="polite">
          ${this.theme === 'system' ? 'System theme selected' : this.theme === 'light' ? 'Light theme selected' : 'Dark theme selected'}
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'theme-toggle': ThemeToggle;
  }
}
