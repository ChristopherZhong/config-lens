import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './algorithm-selector';
import { AlgorithmSelector } from './algorithm-selector';

describe('AlgorithmSelector Component', () => {
  let element: AlgorithmSelector;

  beforeEach(() => {
    element = document.createElement('algorithm-selector') as AlgorithmSelector;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should render correct default values', () => {
    expect(element.selectedAlgorithm).toBe('base64');
    expect(element.mode).toBe('encode');
  });

  it('should render options for base64, url, hex, rot13', () => {
    const select = element.shadowRoot?.querySelector('select');
    expect(select).toBeDefined();
    const options = Array.from(select?.querySelectorAll('option') || []).map((opt) => opt.value);
    expect(options).toContain('base64');
    expect(options).toContain('url');
    expect(options).toContain('hex');
    expect(options).toContain('rot13');
  });
});
