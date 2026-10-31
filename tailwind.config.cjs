/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fef6f3',
          100: '#fde9e1',
          200: '#fbd3c3',
          300: '#f7b59a',
          400: '#f18d66',
          500: '#e8714a',
          600: '#d4582f',
          700: '#b24526',
          800: '#933a23',
          900: '#7a3322',
        },
      },
    },
  },
  plugins: [],
}
