/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary, #4F46E5)',
        secondary: 'var(--secondary, #10B981)',
        'purple-400': 'var(--purple-400, #A855F7)',
        'pink-400': 'var(--pink-400, #F472B6)',
        'cyan-400': 'var(--cyan-400, #22D3EE)',
        'slate-950': 'var(--slate-950, #020617)',
        'purple-950': 'var(--purple-950, #581C87)',
        dark: '#111827',
        light: '#F9FAFB'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
        'float-orb': 'floatOrb 20s infinite ease-in-out',
        'gradient-shift': 'gradientShift 3s infinite linear',
        'arrow-move': 'arrowMove 1.5s infinite ease-in-out',
        'scale-in': 'scaleIn 0.5s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(50px, -50px) scale(1.1)' }
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' }
        },
        arrowMove: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'cyberpunk-gradient': 'linear-gradient(to bottom, var(--slate-950), var(--purple-950), var(--slate-950))',
        'glass-card': 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'badge-gradient': 'linear-gradient(to right, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2))',
        'cta-gradient': 'linear-gradient(to right, var(--primary), var(--pink-400))'
      }
    },
  },
  plugins: [],
}