/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'Segoe UI Variable', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Segoe UI', 'Segoe UI Variable', 'system-ui', '-apple-system', 'sans-serif'],
        logo: ['Orbitron', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
