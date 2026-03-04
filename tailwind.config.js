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
        brand: {
          green: '#3DBE6C',
          teal: '#4BBFBF',
          'green-light': '#E8F8EF',
          'teal-light': '#E8F6F6',
          'green-dark': '#2DA058',
          'teal-dark': '#3AA0A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
