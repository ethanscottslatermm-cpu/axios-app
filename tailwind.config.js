/** @type {import('tailwindcss').Config} */
export default {
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        axios: {
          black: '#080808',
          dark: '#0a0a0a',
          border: 'rgba(255,255,255,0.08)',
          muted: 'rgba(255,255,255,0.35)',
        },
      },
    },
  },
  plugins: [],
}
