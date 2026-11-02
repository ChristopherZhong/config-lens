import { Algorithm } from './types/algorithm.interface';

export const base64Algorithm: Algorithm = {
  id: 'base64',
  name: 'Base64',
  encode: (input: string): string => {
    if (!input) return '';
    const bytes = new TextEncoder().encode(input);
    let binString = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString);
  },
  decode: (input: string): string => {
    if (!input) return '';
    const cleaned = input.trim().replace(/\s+/g, '');
    try {
      const binString = atob(cleaned);
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new Error('Invalid Base64 input or invalid UTF-8 sequence.');
    }
  },
};
