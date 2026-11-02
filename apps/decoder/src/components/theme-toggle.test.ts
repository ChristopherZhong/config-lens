import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './theme-toggle';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle Component', () => {
  let element: ThemeToggle;

  beforeEach(() => {
    element = document.createElement('theme-toggle') as ThemeToggle;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should initialize and apply the default theme', () => {
    expect(element.theme).toBeDefined();
    const hasThemeClass =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.classList.contains('light');
    expect(hasThemeClass).toBe(true);
  });

  it('should toggle theme on click', () => {
    const initialTheme = element.theme;
    const button = element.shadowRoot?.querySelector('button');
    expect(button).toBeDefined();
    button?.click();
    expect(element.theme).not.toBe(initialTheme);
  });
});
