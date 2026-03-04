/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'buy': '#059669',
        'sell': '#dc2626',
        'primary': '#2563eb',
      },
      animation: {
        'highlight': 'highlight 1s ease-out',
      },
      keyframes: {
        highlight: {
          '0%': { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
          '100%': { backgroundColor: 'transparent' },
        }
      }
    },
  },
  plugins: [],
}
