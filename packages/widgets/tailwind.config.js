/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'electric-violet': '#7C4DFF',
        'deep-purple': '#512DA8',
      },
      fontFamily: {
        heading: ['Josefin Sans', 'sans-serif'],
        body: ['Inter', 'Source Sans Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};