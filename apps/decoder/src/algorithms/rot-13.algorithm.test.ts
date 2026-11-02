import { describe, it, expect } from 'vitest';
import { rot13Algorithm } from './rot-13.algorithm';

describe('ROT13 Algorithm', () => {
  it('should encode and decode correctly', () => {
    const input = 'Hello, World! 123';
    const encoded = rot13Algorithm.encode(input);
    expect(encoded).toBe('Uryyb, Jbeyq! 123');
    expect(rot13Algorithm.decode(encoded)).toBe(input);
  });

  it('should return empty string for empty input', () => {
    expect(rot13Algorithm.encode('')).toBe('');
    expect(rot13Algorithm.decode('')).toBe('');
  });
});
