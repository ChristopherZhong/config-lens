import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    server: {
      deps: {
        inline: ['@tools/breadcrumb', '@tools/theme-toggle'],
      },
    },
  },
});