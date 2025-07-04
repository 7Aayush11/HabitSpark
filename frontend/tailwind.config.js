/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a12', // deep black
        surface: '#181824',   // dark gray
        primary: '#3b82f6',   // neon blue
        accent: '#8b5cf6',    // purple
        aura: '#06b6d4',      // cyan
        text: '#e0e7ef',      // light text
        shadow: '#1e293b',    // shadow blue-gray
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px #3b82f6, 0 0 20px #3b82f6',
        aura: '0 0 10px #06b6d4, 0 0 20px #06b6d4',
      },
    },
  },
  plugins: [],
}

