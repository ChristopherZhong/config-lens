import { Algorithm } from './types/algorithm.interface';

export const urlPercentEncodingAlgorithm: Algorithm = {
  id: 'url',
  name: 'URL Percent Encoding',
  encode: (input: string): string => {
    if (!input) return '';
    return encodeURIComponent(input);
  },
  decode: (input: string): string => {
    if (!input) return '';
    try {
      return decodeURIComponent(input);
    } catch {
      throw new Error('Malformed URL percent-encoded input.');
    }
  },
};
