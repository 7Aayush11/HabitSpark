/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: '#6f00ff',       // Glowing purple for level highlights
        dark: '#0b0f19',       // Solo Leveling inspired background
        card: '#1a1f2b',       // Card container bg
        text: '#d1d5db',       // Soft white text
      },
    },
  },
  plugins: [],
}