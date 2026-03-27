/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0D0F1A',
        'bg-surface': '#13162A',
        'bg-elevated': '#1C1F35',
        'accent-pink': '#E91E8C',
        'accent-purple': '#7C3AED',
        'success': '#10B981',
        'danger': '#EF4444',
        'warning': '#F59E0B',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'border': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'accent-glow': 'linear-gradient(135deg, #E91E8C, #7C3AED)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'glow-pink': '0 0 20px rgba(233,30,140,0.3)',
        'glow-red': '0 0 40px rgba(239,68,68,0.6)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '10px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
