import { describe, it, expect, beforeEach } from 'vitest';
import type { ThemeToggle } from './theme-toggle';
import './theme-toggle';

describe('ThemeToggle component', () => {
  let element: ThemeToggle;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('theme-toggle') as ThemeToggle;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders with correct active tab and roving tabindex', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const systemBtn = shadow?.querySelector<HTMLButtonElement>('#theme-option-system');
    const lightBtn = shadow?.querySelector<HTMLButtonElement>('#theme-option-light');
    const darkBtn = shadow?.querySelector<HTMLButtonElement>('#theme-option-dark');

    expect(systemBtn).not.toBeNull();
    expect(lightBtn).not.toBeNull();
    expect(darkBtn).not.toBeNull();

    expect(systemBtn?.getAttribute('tabindex')).toBe('0');
    expect(systemBtn?.getAttribute('aria-checked')).toBe('true');

    expect(lightBtn?.getAttribute('tabindex')).toBe('-1');
    expect(lightBtn?.getAttribute('aria-checked')).toBe('false');

    expect(darkBtn?.getAttribute('tabindex')).toBe('-1');
    expect(darkBtn?.getAttribute('aria-checked')).toBe('false');
  });

  it('dispatches theme-change event on click', async () => {
    let selectedTheme = '';
    element.addEventListener('theme-change', (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>;
      selectedTheme = customEvent.detail.theme;
    });

    const lightBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#theme-option-light');
    lightBtn?.click();
    await element.updateComplete;

    expect(selectedTheme).toBe('light');
  });

  it('supports roving tabindex and keyboard arrow key navigation', async () => {
    let selectedTheme = 'system';
    element.addEventListener('theme-change', (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: string }>;
      selectedTheme = customEvent.detail.theme;
      element.theme = customEvent.detail.theme as 'light' | 'dark' | 'system';
    });

    const container = element.shadowRoot?.querySelector<HTMLDivElement>('.theme-toggle');
    expect(container).not.toBeNull();

    // ArrowRight: system -> light
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('light');
    const lightBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#theme-option-light');
    expect(lightBtn?.getAttribute('tabindex')).toBe('0');
    expect(lightBtn?.getAttribute('aria-checked')).toBe('true');

    // ArrowRight: light -> dark
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('dark');
    const darkBtn = element.shadowRoot?.querySelector<HTMLButtonElement>('#theme-option-dark');
    expect(darkBtn?.getAttribute('tabindex')).toBe('0');
    expect(darkBtn?.getAttribute('aria-checked')).toBe('true');

    // ArrowRight (wraps): dark -> system
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('system');

    // ArrowLeft (wraps): system -> dark
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('dark');

    // Home: -> system
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('system');

    // End: -> dark
    container?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await element.updateComplete;

    expect(selectedTheme).toBe('dark');
  });
});
