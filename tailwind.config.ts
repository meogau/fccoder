import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0a192f',
        'cyber-darker': '#111111',
        'neon-green': '#64ffda',
        'neon-blue': '#00BFFF',
        'neon-pink': '#FF00FF',
        'neon-orange': '#FFA500',
        'cyber-gray': '#8892b0',
        'cyber-light-gray': '#ccd6f6',
      },
      fontFamily: {
        'mono': ['Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'terminal-cursor': 'cursor 1s infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        cursor: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'neon-pulse': {
          '0%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' },
          '100%': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
}
export default config