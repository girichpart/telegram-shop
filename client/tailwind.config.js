/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b0c0f',
        sand: '#f4f2ee',
        lime: '#d7ff3f'
      }
    },
  },
  plugins: [],
}