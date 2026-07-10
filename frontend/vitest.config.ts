import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST, emitCss: false })],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
    },
  },
  test: {
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['./tests/unit/setup.ts'],
    environment: 'happy-dom',
  },
});
