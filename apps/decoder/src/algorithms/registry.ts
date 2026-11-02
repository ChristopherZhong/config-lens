/// <reference types="vite/client" />
import { Algorithm } from './types/algorithm.interface';
import { isAlgorithm } from './is-algorithm.guard';

// Eagerly glob-import all files ending in `.algorithm.ts`
const modules = import.meta.glob<{ [key: string]: unknown }>('./*.algorithm.ts', { eager: true });

export const algorithms: Record<string, Algorithm> = {};

for (const path in modules) {
  const module = modules[path];
  for (const key in module) {
    const value = module[key];
    if (isAlgorithm(value)) {
      algorithms[value.id] = value;
    }
  }
}
