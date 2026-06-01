import type { Config } from 'tailwindcss'

// Monochrome editorial theme. Token NAMES are kept identical to the old palette
// so existing pages don't need editing — only the VALUES changed to grayscale.
// Hierarchy comes from type, space, and hairline borders, not color.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: '#E4E4E4', // hairline
        background: '#FFFFFF', // app backdrop (was warm cream)
        shell: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-muted': '#F4F4F4', // subtle block / table header
        ink: '#141414', // near-black, primary text & solid fills
        primary: '#141414',
        secondary: '#6B6B6B', // muted text
        // Accents collapsed to monochrome: no color, just ink/gray.
        accent: '#141414', // links, focus → ink (was orange)
        'accent-soft': '#F4F4F4',
        highlight: '#141414',
        berry: '#3A3A3A',
        grape: '#3A3A3A',
        mint: '#3A3A3A',
        // Status: monochrome. Meaning conveyed by text/weight, not hue (see 01_UI_UX).
        success: '#141414',
        warning: '#6B6B6B',
        danger: '#141414',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '6px', // inputs/buttons (was 18px)
        '2xl': '8px', // cards (was 24px)
        '3xl': '12px', // shell (was 32px)
      },
      boxShadow: {
        // Near-flat: rely on hairline borders instead of heavy elevation.
        card: '0 1px 2px rgba(20,20,20,0.04)',
        'card-hover': '0 1px 3px rgba(20,20,20,0.08)',
        shell: 'none',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.16s ease-out both',
        'pop-in': 'pop-in 0.12s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
