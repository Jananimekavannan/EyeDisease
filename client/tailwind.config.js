/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          darkest: '#050505',
          dark: '#0A0A0A',
          DEFAULT: '#111111',
        },
        surface: {
          1: '#151515',
          2: '#1B1B1B',
          3: '#222222',
          border: '#2A2A2A',
        },
        accent: {
          orange: '#FF5A1F', // Burnt Orange
          crimson: '#C62828', // Deep Crimson
          bright: '#FF7A00', // Bright Orange
          gold: '#D4A84F', // Muted Gold
        },
        status: {
          success: '#35C759',
          warning: '#FFB020',
          danger: '#FF3B30',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A7A7A7',
          muted: '#666666',
        }
      },
      fontFamily: {
        mono: ['Space Grotesk', 'Consolas', 'monospace'],
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -10px rgba(255, 90, 31, 0.25)',
        'crimson': '0 10px 30px -10px rgba(198, 40, 40, 0.25)',
        'brutal': '4px 4px 0px 0px #FF5A1F',
        'brutal-gold': '4px 4px 0px 0px #D4A84F',
        'brutal-dark': '4px 4px 0px 0px #222222',
        'skeuo-inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.05)',
        'skeuo-btn': '0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'scan': 'scanLine 3s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'radar': 'radarSpin 10s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
