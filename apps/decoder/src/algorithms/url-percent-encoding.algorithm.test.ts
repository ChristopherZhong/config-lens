import { describe, it, expect } from 'vitest';
import { urlPercentEncodingAlgorithm } from './url-percent-encoding.algorithm';

describe('URL Percent Algorithm', () => {
  it('should encode and decode standard and special characters', () => {
    const input = 'Hello World! @#&?';
    const encoded = urlPercentEncodingAlgorithm.encode(input);
    expect(encoded).toBe('Hello%20World!%20%40%23%26%3F');
    expect(urlPercentEncodingAlgorithm.decode(encoded)).toBe(input);
  });

  it('should return empty string for empty input', () => {
    expect(urlPercentEncodingAlgorithm.encode('')).toBe('');
    expect(urlPercentEncodingAlgorithm.decode('')).toBe('');
  });

  it('should throw error for malformed URL input', () => {
    expect(() => urlPercentEncodingAlgorithm.decode('%E0%A4%A')).toThrow(
      'Malformed URL percent-encoded input',
    );
  });
});
