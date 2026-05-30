import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral, screenshot-like shell
        border: '#ECECEC',
        background: '#E9E9EB', // gray backdrop behind the app shell
        shell: '#FFFFFF', // the rounded white app shell
        surface: '#FFFFFF',
        'surface-muted': '#F4F4F5',
        ink: '#1A1A1A', // near-black headings / dark highlight card
        primary: '#1A1A1A',
        secondary: '#8A8A8E', // muted text
        // Warm amber accent (NOT green) — fits a food/bakery brand
        accent: '#E8943A',
        'accent-soft': '#FBEEDD',
        highlight: '#F4C04E', // bright honey highlight for hero/earnings
        success: '#2E9E5B',
        warning: '#B45309',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.04)',
        shell: '0 12px 40px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
