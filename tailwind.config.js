/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-navy': '#091413',
        'dark-green': '#285A48',
        'forest-green': '#408A71',
        'mint': '#B0E4CC',
      },
    },
  },
  plugins: [],
}