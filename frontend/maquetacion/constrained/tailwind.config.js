/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        federalBlue: '#03045e',
        honoluluBlue: '#0077b6',
        pacificCyan: '#00b4d8',
        nonPhotoBlue: '#90e0ef',
        lightCyan: '#caf0f8',
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
