/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#0c0a0f',
          900: '#110e18',
          800: '#18141f',
          700: '#201b2a',
          600: '#2c2538',
        },
        gold: {
          300: '#f2d875',
          400: '#e8c05a',
          500: '#d4a83e',
          600: '#b88e28',
        },
        crimson: {
          400: '#e05858',
          500: '#c94444',
          600: '#a83030',
        },
        cream: {
          100: '#fdf8f2',
          200: '#f0e6d3',
          300: '#dfd0b8',
          400: '#b8a498',
          500: '#8a7a70',
          600: '#5c4e46',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'Menlo', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.55s ease both',
        'fade-scale': 'fadeScale 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeScale: {
          '0%': { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
