import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: '#ECE9E3',
        background: '#F6F1EA', // warm cream backdrop — friendlier than cold gray
        shell: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-muted': '#F7F3EC',
        ink: '#24201B', // warm near-black
        primary: '#24201B',
        secondary: '#8A8276', // warm muted text
        accent: '#F2782C', // lively orange — playful primary accent
        'accent-soft': '#FDEBDC',
        highlight: '#FFD24A', // sunny yellow highlight
        berry: '#E85D75', // playful pink/berry secondary accent
        grape: '#7C6BD6', // soft purple tertiary
        mint: '#2FB59A', // fresh teal
        success: '#1FA463',
        warning: '#E08600',
        danger: '#E5484D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        card: '0 2px 4px rgba(36,32,27,0.04), 0 10px 30px rgba(36,32,27,0.06)',
        'card-hover': '0 8px 16px rgba(36,32,27,0.06), 0 20px 50px rgba(36,32,27,0.10)',
        shell: '0 16px 50px rgba(36,32,27,0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.25s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
