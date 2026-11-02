import { Algorithm } from './types/algorithm.interface';

export function isAlgorithm(value: unknown): value is Algorithm {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'encode' in value &&
    typeof value.encode === 'function' &&
    'decode' in value &&
    typeof value.decode === 'function'
  );
}
