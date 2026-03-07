import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7C3AED', // violet-600
          foreground: '#FFFFFF',
          light: '#DDD6FE', // violet-200
        },
        // Semantic colors from Design System
        debt: '#EF4444', // red-500
        credit: '#10B981', // emerald-500
        neutral: '#64748B', // slate-500
      },
      backgroundColor: {
        background: '#F8FAFC', // slate-50
        surface: '#FFFFFF', // white
      },
    },
  },
};

export default config;
