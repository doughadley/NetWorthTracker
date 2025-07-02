/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7', // sky-600
          hover: '#0369a1', // sky-700
          light: '#e0f2fe' // sky-100
        },
        secondary: '#475569', // slate-600
        accent: '#10b981', // emerald-500
      }
    },
  },
  plugins: [],
}
