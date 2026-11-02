import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ThemeToggle } from './theme-toggle';
import './index';

describe('ThemeToggle component', () => {
  let element: ThemeToggle;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('theme-toggle') as ThemeToggle;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('renders the active theme with roving tabindex', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const systemButton = shadow?.querySelector<HTMLButtonElement>('#theme-option-system');
    const lightButton = shadow?.querySelector<HTMLButtonElement>('#theme-option-light');
    const darkButton = shadow?.querySelector<HTMLButtonElement>('#theme-option-dark');

    expect(systemButton?.getAttribute('tabindex')).toBe('0');
    expect(systemButton?.getAttribute('aria-checked')).toBe('true');
    expect(lightButton?.getAttribute('tabindex')).toBe('-1');
    expect(lightButton?.getAttribute('aria-checked')).toBe('false');
    expect(darkButton?.getAttribute('tabindex')).toBe('-1');
    expect(darkButton?.getAttribute('aria-checked')).toBe('false');
  });

  it('dispatches the selected theme when an option is clicked', async () => {
    let selectedTheme = '';
    element.addEventListener('theme-change', (event: Event) => {
      selectedTheme = (event as CustomEvent<{ theme: string }>).detail.theme;
    });

    element.shadowRoot?.querySelector<HTMLButtonElement>('#theme-option-light')?.click();
    await element.updateComplete;

    expect(selectedTheme).toBe('light');
  });

  it('supports arrow, Home, and End keyboard navigation', async () => {
    let selectedTheme = 'system';
    element.addEventListener('theme-change', (event: Event) => {
      const theme = (event as CustomEvent<{ theme: 'system' | 'light' | 'dark' }>).detail.theme;
      selectedTheme = theme;
      element.theme = theme;
    });

    const group = element.shadowRoot?.querySelector<HTMLDivElement>('.theme-toggle');
    expect(group).not.toBeNull();

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('light');
    expect(element.shadowRoot?.querySelector('#theme-option-light')?.getAttribute('tabindex')).toBe('0');

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('dark');

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('system');

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('dark');

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('system');

    group?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await element.updateComplete;
    expect(selectedTheme).toBe('dark');
  });

  it('announces the selected theme in a live region', async () => {
    const statusRegion = element.shadowRoot?.querySelector('[role="status"]');
    expect(statusRegion?.textContent?.trim()).toBe('System theme selected');

    element.theme = 'light';
    await element.updateComplete;
    expect(statusRegion?.textContent?.trim()).toBe('Light theme selected');

    element.theme = 'dark';
    await element.updateComplete;
    expect(statusRegion?.textContent?.trim()).toBe('Dark theme selected');
  });
});