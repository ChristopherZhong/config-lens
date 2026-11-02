import { Algorithm } from './types/algorithm.interface';

export const hexadecimalAlgorithm: Algorithm = {
  id: 'hex',
  name: 'Hexadecimal',
  encode: (input: string): string => {
    if (!input) return '';
    const bytes = new TextEncoder().encode(input);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },
  decode: (input: string): string => {
    if (!input) return '';
    // Clean spaces, colons, and prefix "0x" or "\x"
    const cleaned = input.replace(/\s+|:|0x|\\x/gi, '');
    if (cleaned.length % 2 !== 0) {
      throw new Error('Hexadecimal string must have an even length.');
    }
    if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
      throw new Error('Hexadecimal string contains invalid characters.');
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
    }
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new Error('Decoded bytes do not form a valid UTF-8 string.');
    }
  },
};
