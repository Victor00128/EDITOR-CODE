/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hacker-green': '#00ff00',
        'hacker-bg': '#050505',     // Casi negro puro
        'hacker-panel': '#0a0a0a',  // Un poco más claro para paneles
        'hacker-border': '#222222', // Bordes sutiles
        'hacker-text': '#cccccc',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'], // Fuente estilo código
      }
    },
  },
  plugins: [],
}