/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morocco: {
          green: {
            DEFAULT: '#006233',
            50: '#f0fdf4',
            100: '#dcfce7',
            600: '#006233',
            700: '#004d28',
            800: '#003a1e',
            900: '#002613',
          },
          red: {
            DEFAULT: '#C1272D',
            50: '#fef2f2',
            600: '#C1272D',
            700: '#9b1e23',
          },
          gold: {
            DEFAULT: '#D4AF37',
            50: '#fbf8eb',
            600: '#b89428',
          }
        }
      }
    },
  },
  plugins: [],
}
