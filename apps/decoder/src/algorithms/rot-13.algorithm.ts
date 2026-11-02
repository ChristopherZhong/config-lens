import { Algorithm } from './types/algorithm.interface';

export const rot13Algorithm: Algorithm = {
  id: 'rot13',
  name: 'ROT13',
  encode: (input: string): string => {
    if (!input) return '';
    return input.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const start = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - start + 13) % 26) + start);
    });
  },
  decode: (input: string): string => {
    if (!input) return '';
    // ROT13 is symmetric
    return rot13Algorithm.encode(input);
  },
};
