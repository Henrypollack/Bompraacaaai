/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        acai: {
          100: '#f3e8ff',
          200: '#d8b4fe',
          500: '#a855f7',
          700: '#7e22ce',
          900: '#581c87', // Deep purple
        }
      }
    },
  },
  plugins: [],
}