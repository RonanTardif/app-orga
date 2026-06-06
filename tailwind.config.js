/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F3EF',
          card: '#FFFDFB',
        },
        sage: {
          DEFAULT: '#7A9A87',
          dark: '#4D6A58',
        },
        rose: {
          DEFAULT: '#CC8C9A',
          dark: '#9E6170',
        },
        border: {
          card: '#E9E1DA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
