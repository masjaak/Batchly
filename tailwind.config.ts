import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: '#E7EAE3',
        background: '#F3F5F0',
        surface: '#FFFFFF',
        'surface-muted': '#F4F6F1',
        primary: '#16241B', // deep forest ink — headings & dark buttons
        secondary: '#6A7468', // muted text
        accent: '#1F8A4C', // emerald — active states, links, positive accents
        'accent-soft': '#E7F4EC',
        lime: '#C6F26B', // bright highlight — hero / earnings card
        forest: '#143524', // dark green card background
        success: '#1F8A4C',
        warning: '#B45309',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '26px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20, 53, 36, 0.04), 0 8px 24px rgba(20, 53, 36, 0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
