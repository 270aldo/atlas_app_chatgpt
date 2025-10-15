/** @type {import('tailwindcss').Config} */
export default {
  content: ['./packages/widgets/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'electric-violet': '#7C4DFF',
        'deep-purple': '#512DA8',
      },
      fontFamily: {
        heading: ['Josefin Sans', 'sans-serif'],
        body: ['Inter', 'Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
