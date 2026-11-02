import { describe, it, expect } from 'vitest';
import { base64Algorithm } from './base-64.algorithm';

describe('Base64 Algorithm', () => {
  it('should encode and decode standard text', () => {
    const input = 'Hello, World!';
    const encoded = base64Algorithm.encode(input);
    expect(encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
    expect(base64Algorithm.decode(encoded)).toBe(input);
  });

  it('should handle Unicode and Emojis', () => {
    const input = 'こんにちは 🌎 🔥';
    const encoded = base64Algorithm.encode(input);
    expect(base64Algorithm.decode(encoded)).toBe(input);
  });

  it('should return empty string for empty input', () => {
    expect(base64Algorithm.encode('')).toBe('');
    expect(base64Algorithm.decode('')).toBe('');
  });

  it('should throw error for invalid Base64 input', () => {
    expect(() => base64Algorithm.decode('This is not base64!!!')).toThrow('Invalid Base64 input');
  });
});
