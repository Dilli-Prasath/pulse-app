/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06080f',
        bg2: '#0a0e1a',
        panel: 'rgba(18,24,42,0.66)',
        panelSolid: '#121826',
        line: 'rgba(120,160,255,0.12)',
        line2: 'rgba(120,160,255,0.22)',
        txt: '#e8eefc',
        muted: '#7d89a8',
        muted2: '#566184',
        cyan: '#22e3ff',
        violet: '#8b5cff',
        pink: '#ff4fd8',
        green: '#2bffb0',
        amber: '#ffcf5c',
        red: '#ff5d7a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glowCyan: '0 0 22px rgba(34,227,255,.45)',
        glowViolet: '0 0 22px rgba(139,92,255,.45)',
      },
      backgroundImage: {
        grad: 'linear-gradient(135deg,#22e3ff,#8b5cff 55%,#ff4fd8)',
      },
      keyframes: {
        fade: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'none' } },
        pop: { '0%': { opacity: '0', transform: 'scale(.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        fade: 'fade .35s ease',
        pop: 'pop .25s ease',
      },
    },
  },
  plugins: [],
}
