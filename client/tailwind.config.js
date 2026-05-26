/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F3EE',
        card: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'accent-green': '#1F7A5C',
        'dark-green': '#14532D',
        'dark-section': '#0F172A',
        'soft-accent': '#DCEFE8',
        'border-light': 'rgba(17,24,39,0.08)',
        'glow-green': 'rgba(31,122,92,0.18)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Fraunces', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(17, 24, 39, 0.04), 0 2px 8px -1px rgba(17, 24, 39, 0.02)',
        'float': '0 20px 40px -15px rgba(31, 122, 92, 0.12), 0 10px 20px -10px rgba(17, 24, 39, 0.05)',
      }
    },
  },
  plugins: [],
}
