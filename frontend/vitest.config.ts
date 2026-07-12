import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Tests don't touch styles; override PostCSS discovery so Vite doesn't try
  // to load the project's Tailwind PostCSS config.
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
