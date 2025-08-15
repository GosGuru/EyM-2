/**
 * Configuración de Tailwind CSS para EYM Indumentaria
 * Incluye la paleta de colores personalizada según la identidad visual.
 */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'eym-dark': '#1A1A1A',
        'eym-light': '#F8F8F8',
        'eym-gray-medium': '#D3D3D3',
        'eym-accent-orange': '#FF8C00',
        'eym-accent-purple': '#8A2BE2',
        'eym-accent-teal': '#40E0D0',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Animaciones respetuosas con prefers-reduced-motion
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      // Reducir animaciones para usuarios que prefieren menos movimiento
      transitionProperty: {
        'reduced-motion': 'none',
      },
    },
  },
  plugins: [
    // Plugin personalizado para respetar prefers-reduced-motion
    function({ addUtilities }) {
      const newUtilities = {
        '@media (prefers-reduced-motion: reduce)': {
          '.motion-reduce': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
          },
          '*': {
            'animation-duration': '0.01ms !important',
            'animation-iteration-count': '1 !important',
            'transition-duration': '0.01ms !important',
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 