import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  // Serve dataset files
  publicDir: 'dataset',
  
  server: {
    port: 5173,
    host: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
});
