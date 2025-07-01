// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aura: '#a855f7',
        gate: '#2e1065',
        levelUp: '#facc15',
        darkBg: '#0f0f1a',
        glow: '#7c3aed'
      },
      backgroundImage: {
        'dungeon-gate': "url('/assets/gate.avif')",
        'grid-pattern': "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)"
      },
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans]
      },
      boxShadow: {
        aura: "0 0 20px 4px rgba(168,85,247,0.5)",
        gate: "0 0 30px 6px rgba(46,16,101,0.7)"
      },
      animation: {
        fadeIn: "fadeIn 1.2s ease-out",
        pulseAura: "pulseAura 2s infinite ease-in-out"
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        pulseAura: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(168,85,247,0.6)' },
          '50%': { boxShadow: '0 0 25px rgba(168,85,247,1)' }
        }
      }
    },
  },
  plugins: []
}