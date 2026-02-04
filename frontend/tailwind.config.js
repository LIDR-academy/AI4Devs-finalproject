/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          primary: '#0052A3',      // Azul médico principal (del mockup)
          secondary: '#0066CC',    // Azul médico secundario (del mockup)
          accent: '#E3F2FD',        // Azul claro (del mockup)
          success: '#28A745',       // Verde éxito (del mockup)
          warning: '#FFC107',       // Amarillo advertencia (del mockup)
          danger: '#DC3545',        // Rojo peligro (del mockup)
          light: '#E3F2FD',         // Azul claro
          dark: '#2C3E50',          // Gris oscuro (del mockup)
          white: '#FFFFFF',
          gray: {
            50: '#F5F7FA',          // Fondo claro (del mockup)
            100: '#F8F9FA',
            200: '#E0E0E0',          // Borde (del mockup)
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6C757D',          // Texto claro (del mockup)
            600: '#4B5563',
            700: '#374151',
            800: '#2C3E50',          // Texto oscuro (del mockup)
            900: '#111827',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
