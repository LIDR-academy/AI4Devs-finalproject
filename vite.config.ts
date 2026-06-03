import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Raíz del proyecto Vite: SPA bajo frontend/
  root: path.resolve(__dirname, 'frontend'),

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Reenvía /api al servidor Express (npm run dev:api) para que fetch('/api/...') funcione en :5173.
  server: {
    proxy: {
      // /health vive sin prefijo /api; /api/profile sí lo usa — regla específica antes del catch-all.
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: () => '/health',
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
