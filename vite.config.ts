import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { version } from './package.json' with { type: 'json' };

export default defineConfig({
  base: '/linter/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '~src': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
