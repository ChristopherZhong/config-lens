import { describe, it, expect } from 'vitest';
import { hexadecimalAlgorithm } from './hexadecimal.algorithm';

describe('Hexadecimal Algorithm', () => {
  it('should encode and decode standard text', () => {
    const input = 'ABC';
    const encoded = hexadecimalAlgorithm.encode(input);
    expect(encoded).toBe('414243');
    expect(hexadecimalAlgorithm.decode(encoded)).toBe(input);
  });

  it('should handle cleanups like spaces, colons, and prefixes', () => {
    const input = 'Hello';
    const encoded = hexadecimalAlgorithm.encode(input); // 48656c6c6f
    expect(encoded).toBe('48656c6c6f');
    expect(hexadecimalAlgorithm.decode('48 65 6c 6c 6f')).toBe(input);
    expect(hexadecimalAlgorithm.decode('48:65:6c:6c:6f')).toBe(input);
    expect(hexadecimalAlgorithm.decode('0x480x650x6c0x6c0x6f')).toBe(input);
    expect(hexadecimalAlgorithm.decode('\\x48\\x65\\x6c\\x6c\\x6f')).toBe(input);
  });

  it('should return empty string for empty input', () => {
    expect(hexadecimalAlgorithm.encode('')).toBe('');
    expect(hexadecimalAlgorithm.decode('')).toBe('');
  });

  it('should throw error for odd length hex string', () => {
    expect(() => hexadecimalAlgorithm.decode('414')).toThrow(
      'Hexadecimal string must have an even length.',
    );
  });

  it('should throw error for invalid characters', () => {
    expect(() => hexadecimalAlgorithm.decode('414G')).toThrow(
      'Hexadecimal string contains invalid characters.',
    );
  });

  it('should throw error for invalid UTF-8 bytes', () => {
    // FF is an invalid UTF-8 single byte
    expect(() => hexadecimalAlgorithm.decode('FF')).toThrow(
      'Decoded bytes do not form a valid UTF-8 string.',
    );
  });
});
