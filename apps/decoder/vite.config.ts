/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../../dist/decoder',
  },
  root: 'src',
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
