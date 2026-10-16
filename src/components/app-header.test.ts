import { describe, it, expect, beforeEach } from 'vitest';
import './app-header';
import type { AppHeader } from './app-header';

describe('AppHeader component', () => {
  let element: AppHeader;

  beforeEach(async () => {
    document.body.innerHTML = '';
    element = document.createElement('app-header') as AppHeader;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  it('renders logo icon marked decorative with empty alt and aria-hidden', () => {
    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();

    const logoImg = shadow?.querySelector('.logo img');
    expect(logoImg).not.toBeNull();
    expect(logoImg?.getAttribute('aria-hidden')).toBe('true');
    expect(logoImg?.getAttribute('alt')).toBe('');
  });
});
