/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // YEH LINE ADD KARNI HAI
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', 
      }
    },
  },
  plugins: [],
}