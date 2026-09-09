/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
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
