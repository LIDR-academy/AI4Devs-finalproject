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
          primary: '#2C5F7C',      // Azul médico principal
          secondary: '#4A90A4',    // Azul médico secundario
          accent: '#6BB6B8',       // Turquesa médico
          success: '#5CB85C',      // Verde éxito
          warning: '#F0AD4E',      // Amarillo advertencia
          danger: '#D9534F',       // Rojo peligro
          light: '#E8F4F8',        // Azul claro
          dark: '#1A3A4A',        // Azul oscuro
          white: '#FFFFFF',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
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
