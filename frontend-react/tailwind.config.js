/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef5ee',
          100: '#fde9d7',
          200: '#facfae',
          300: '#f7ae7a',
          400: '#f38244',
          500: '#f0601f',
          600: '#e14515',
          700: '#bb3213',
          800: '#952918',
          900: '#782516',
        },
      },
    },
  },
  plugins: [],
}
