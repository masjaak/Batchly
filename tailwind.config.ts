import type { Config } from 'tailwindcss'

// "Morning" inspired design system: warm cream backdrop, soft pastels for
// accents, deep ink for hierarchy. Tokens follow a semantic naming scheme so
// the rest of the app just refers to the role, not the hue.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: '#F5EFE5', // warm cream app backdrop
        shell: '#F5EFE5',
        surface: '#FFFFFF', // cards, inputs
        'surface-muted': '#FAF6EC', // nested block / table header
        cream: '#F5EFE5',
        creamSoft: '#FBF7EE',
        // Ink / text
        ink: '#1F1B16', // near-black, primary text & solid fills
        primary: '#1F1B16',
        secondary: '#8B8580', // muted brown text
        tertiary: '#B5AFA6', // even lighter
        border: '#E8E2D5', // hairline on cream backdrop
        'border-soft': '#EFE9DC',
        // Accent fills (soft pastel rounds behind icons / status)
        lavender: '#EFE5FF', // active nav highlight
        'lavender-strong': '#D9C8FB',
        pink: '#FCE7F3', // soft pink badge / chart area
        'pink-strong': '#EC4899', // bright pink (positive accent)
        'pink-soft': '#FDF2F8',
        purple: '#F3E8FF', // light purple
        'purple-strong': '#A78BFA',
        yellow: '#FEF3C7', // soft yellow
        'yellow-strong': '#F59E0B',
        blue: '#DBEAFE', // soft blue
        'blue-strong': '#60A5FA',
        mint: '#D1FAE5',
        'mint-strong': '#10B981',
        // Status (semantic; consistent with pastel palette)
        success: '#1F1B16',
        warning: '#B45309',
        danger: '#B91C1C',
        // Highlights
        accent: '#1F1B16', // primary CTA & links
        'accent-soft': '#FAF6EC',
        highlight: '#1F1B16',
        berry: '#EC4899',
        grape: '#A78BFA',
        mintc: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '16px', // inputs/buttons
        '2xl': '20px', // cards
        '3xl': '28px', // hero/shell
        '4xl': '36px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 27, 22, 0.04)',
        'card-hover': '0 2px 6px rgba(31, 27, 22, 0.08)',
        soft: '0 1px 3px rgba(31, 27, 22, 0.04), 0 1px 2px rgba(31, 27, 22, 0.03)',
        pop: '0 4px 16px rgba(31, 27, 22, 0.08)',
        ring: '0 0 0 4px rgba(31, 27, 22, 0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.18s ease-out both',
        'pop-in': 'pop-in 0.14s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
