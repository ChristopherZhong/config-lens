import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { DecoderApp } from './decoder-app';
import './decoder-app';

describe('DecoderApp theme integration', () => {
  let element: DecoderApp;

  beforeEach(() => {
    element = document.createElement('decoder-app') as DecoderApp;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('applies and persists a selected theme', async () => {
    await element.updateComplete;
    const darkButton = element.shadowRoot
      ?.querySelector('theme-toggle')
      ?.shadowRoot?.querySelector<HTMLButtonElement>('#theme-option-dark');
    darkButton?.click();
    await element.updateComplete;

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});