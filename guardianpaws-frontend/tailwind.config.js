/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#121212',
        'bg-card': '#1e1e1e',
        'bg-hover': '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
      },
      borderRadius: {
        'search': '9999px',
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
} 