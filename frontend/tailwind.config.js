/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f4f0",
          100: "#e8e5dd",
          200: "#d0cab8",
          300: "#b5ab93",
          400: "#958771",
          500: "#7a6d58",
          600: "#61564a",
          700: "#4a4139",
          800: "#312c27",
          900: "#1a1714",
          950: "#0d0b09",
        },
        accent: {
          DEFAULT: "#c8a96e",
          light: "#e2c98a",
          dark: "#a07c3f",
        },
        surface: "#f7f5f0",
      },
    },
  },
  plugins: [],
};
