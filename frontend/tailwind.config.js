/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#004e68',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#086788',
          600: '#004e68',
          700: '#003e54',
          800: '#002f40',
          900: '#001e2b',
        },
        'primary-container': '#086788',
        'on-primary': '#ffffff',
        'primary-fixed': '#c1e8ff',
        'primary-fixed-dim': '#88cff5',
        secondary: {
          DEFAULT: '#00687a',
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          500: '#00687a',
          600: '#005969',
        },
        'secondary-container': '#57dffe',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#006172',
        'secondary-fixed': '#acedff',
        'secondary-fixed-dim': '#4cd7f6',
        tertiary: {
          DEFAULT: '#793200',
          500: '#793200',
        },
        'tertiary-container': '#9f4400',
        'on-tertiary': '#ffffff',
        'tertiary-fixed': '#ffdbca',
        'tertiary-fixed-dim': '#ffb690',
        surface: '#f6f9ff',
        'surface-container': '#e0f0ff',
        'surface-container-low': '#ebf5ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#daeafa',
        'surface-container-highest': '#d5e4f4',
        'surface-variant': '#d5e4f4',
        'on-surface': '#0e1d28',
        'on-surface-variant': '#40484d',
        background: '#f6f9ff',
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        }
      }
    },
  },
  plugins: [],
}
