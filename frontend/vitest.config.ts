import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // next/font is not available in jsdom — mock it so layout.tsx imports safely
      'next/font/google': path.resolve(__dirname, './src/test/mocks/next-font.ts'),
      'next/font/local': path.resolve(__dirname, './src/test/mocks/next-font.ts'),
    },
  },
});
