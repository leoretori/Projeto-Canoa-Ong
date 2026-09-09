/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#1E40AF',
          600: '#1E3A8A',
        },
        accent: {
          500: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}

