import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: [
      'src/**/*.test.{ts,tsx}',
      'src/**/__integration__/**/*.test.{ts,tsx}',
    ],
    coverage: {
      include: ['src/components/Dashboard/**', 'src/stores/**', 'src/hooks/**'],
    },
    // Run tests sequentially to avoid DOM/mock state conflicts in integration tests
    fileParallelism: false,
  },
});
