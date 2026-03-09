/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f3ef',
          100: '#e8e3da',
          200: '#d4cbb8',
          300: '#b8aa90',
          400: '#9a8b6a',
          500: '#7d6e52',
          600: '#655843',
          700: '#504638',
          800: '#3d3530',
          900: '#2a2420',
          950: '#1a1714',
        },
        gold: {
          400: '#d4a853',
          500: '#c49332',
          600: '#a87820',
        }
      }
    },
  },
  plugins: [],
}
