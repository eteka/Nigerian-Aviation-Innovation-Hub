/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        naija: {
          green: '#008751',
          emerald: '#10B981',
          ivory: '#FFFBF0',
          harmattan: '#F4A460',
          lagos: '#1E40AF',
          delta: '#059669',
        },
        adire: {
          indigo: '#4338CA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.1 },
        },
        contrail: {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateX(100vw)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
