/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 📱 BREAKPOINTS COMPLETOS
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    
    // 📏 ESPACIADO COMPLETO EN PX (0 a 960px)
    spacing: {
      '0': '0px',
      'px': '1px',
      '0.5': '2px',
      '1': '4px',
      '1.5': '6px',
      '2': '8px',
      '2.5': '10px',
      '3': '12px',
      '3.5': '14px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '14': '56px',
      '16': '64px',
      '18': '72px',
      '20': '80px',
      '22': '88px',
      '24': '96px',
      '26': '104px',
      '28': '112px',
      '30': '120px',
      '32': '128px',
      '34': '136px',
      '36': '144px',
      '38': '152px',
      '40': '160px',
      '42': '168px',
      '44': '176px',
      '46': '184px',
      '48': '192px',
      '50': '200px',
      '52': '208px',
      '54': '216px',
      '56': '224px',
      '58': '232px',
      '60': '240px',
      '62': '248px',
      '64': '256px',
      '66': '264px',
      '68': '272px',
      '70': '280px',
      '72': '288px',
      '74': '296px',
      '76': '304px',
      '78': '312px',
      '80': '320px',
      '82': '328px',
      '84': '336px',
      '86': '344px',
      '88': '352px',
      '90': '360px',
      '92': '368px',
      '94': '376px',
      '96': '384px',
      '98': '392px',
      '100': '400px',
      '104': '416px',
      '108': '432px',
      '112': '448px',
      '116': '464px',
      '120': '480px',
      '124': '496px',
      '128': '512px',
      '136': '544px',
      '144': '576px',
      '152': '608px',
      '160': '640px',
      '168': '672px',
      '176': '704px',
      '184': '736px',
      '192': '768px',
      '200': '800px',
      '208': '832px',
      '216': '864px',
      '224': '896px',
      '232': '928px',
      '240': '960px',
      '256': '1024px',
      '288': '1152px',
      '320': '1280px',
      '384': '1536px',
    },
    
    extend: {
      // 🎨 COLORES COMPLETOS (TUS COLORES + PALETAS COMPLETAS)
      colors: {
        // TUS COLORES PRINCIPALES
        'primary': '#fa3131',
        'secondary': '#0248a8',
        'background': '#000000',
        'white': '#ffffff',
        
        // PALETA ROJA COMPLETA (primary)
        'red': {
          25: '#fff5f5',
          50: '#fff1f1',
          100: '#ffe1e1',
          150: '#ffd4d4',
          200: '#ffc8c8',
          250: '#ffb5b5',
          300: '#ffa2a2',
          350: '#ff8a8a',
          400: '#ff6b6b',
          450: '#ff4e4e',
          500: '#fa3131',
          550: '#e61c1c',
          600: '#d41616',
          650: '#c21414',
          700: '#a11414',
          750: '#8a1212',
          800: '#721010',
          850: '#5c0e0e',
          900: '#460a0a',
          950: '#2e0707',
        },
        
        // PALETA AZUL COMPLETA (secondary)
        'blue': {
          25: '#f5f9ff',
          50: '#eef6ff',
          100: '#d9edff',
          150: '#c5e4ff',
          200: '#bce0ff',
          250: '#a8d6ff',
          300: '#8ecdff',
          350: '#74c3ff',
          400: '#59afff',
          450: '#409aff',
          500: '#308cfa',
          550: '#2475e0',
          600: '#1a6ed9',
          650: '#1557b6',
          700: '#124c9e',
          750: '#0e3d80',
          800: '#0248a8',
          850: '#063a7a',
          900: '#052c5c',
          950: '#031d3d',
        },
        
        // GRISES COMPLETOS (para textos, bordes, fondos)
        'gray': {
          25: '#fcfcfc',
          50: '#f7f7f7',
          75: '#f0f0f0',
          100: '#e6e6e6',
          150: '#dddddd',
          200: '#cccccc',
          250: '#bfbfbf',
          300: '#b3b3b3',
          350: '#a6a6a6',
          400: '#999999',
          450: '#8c8c8c',
          500: '#808080',
          550: '#737373',
          600: '#666666',
          650: '#595959',
          700: '#4d4d4d',
          750: '#404040',
          800: '#333333',
          825: '#2a2a2a',
          850: '#222222',
          875: '#1a1a1a',
          900: '#111111',
          925: '#0a0a0a',
          950: '#050505',
        },
        
        // COLORES DE ESTADO
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
        
        'success-light': '#d1fae5',
        'error-light': '#fee2e2',
        'warning-light': '#fed7aa',
        'info-light': '#dbeafe',
      },
      
      // 🔤 TIPOGRAFÍA COMPLETA
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'heading': ['Poppins', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // 📏 TAMAÑOS DE FUENTE COMPLETOS
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        '6xl': ['60px', { lineHeight: '60px', letterSpacing: '-0.02em' }],
        '7xl': ['72px', { lineHeight: '72px', letterSpacing: '-0.02em' }],
        '8xl': ['96px', { lineHeight: '96px', letterSpacing: '-0.02em' }],
        '9xl': ['120px', { lineHeight: '120px', letterSpacing: '-0.02em' }],
      },
      
      // 💪 PESO DE FUENTE
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      
      // 📐 BORDES REDONDEADOS COMPLETOS
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
        'full': '9999px',
      },
      
      // 🎭 SOMBRAS COMPLETAS
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 8px 12px -2px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 12px 16px -4px rgb(0 0 0 / 0.1), 0 6px 8px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 24px -6px rgb(0 0 0 / 0.1), 0 8px 10px -8px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        
        // SOMBRAS CON TUS COLORES
        'primary-sm': '0 2px 8px rgba(250, 49, 49, 0.2)',
        'primary-md': '0 4px 12px rgba(250, 49, 49, 0.25)',
        'primary-lg': '0 8px 20px rgba(250, 49, 49, 0.3)',
        'primary-xl': '0 12px 28px rgba(250, 49, 49, 0.35)',
        'primary-glow': '0 0 20px rgba(250, 49, 49, 0.4), 0 0 40px rgba(250, 49, 49, 0.2)',
        
        'secondary-sm': '0 2px 8px rgba(2, 72, 168, 0.2)',
        'secondary-md': '0 4px 12px rgba(2, 72, 168, 0.25)',
        'secondary-lg': '0 8px 20px rgba(2, 72, 168, 0.3)',
        'secondary-glow': '0 0 20px rgba(2, 72, 168, 0.4), 0 0 40px rgba(2, 72, 168, 0.2)',
        
        'dark-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 8px 20px rgba(0, 0, 0, 0.5)',
        
        'none': 'none',
      },
      
      // 🌈 BACKGROUND IMAGES COMPLETOS
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fa3131 0%, #0248a8 100%)',
        'gradient-primary-horizontal': 'linear-gradient(90deg, #fa3131 0%, #0248a8 100%)',
        'gradient-primary-diagonal': 'linear-gradient(45deg, #fa3131 0%, #0248a8 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        'gradient-dark-radial': 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
        'gradient-red': 'linear-gradient(135deg, #fa3131 0%, #c21414 100%)',
        'gradient-blue': 'linear-gradient(135deg, #0248a8 0%, #063a7a 100%)',
        'gradient-text': 'linear-gradient(135deg, #fa3131 0%, #0248a8 100%)',
      },
      
      // 🎬 ANIMACIONES COMPLETAS
      animation: {
        // FADES
        'fade-in': 'fadeIn 0.5s ease forwards',
        'fade-out': 'fadeOut 0.5s ease forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-down': 'fadeDown 0.6s ease-out forwards',
        'fade-left': 'fadeLeft 0.6s ease-out forwards',
        'fade-right': 'fadeRight 0.6s ease-out forwards',
        
        // SCALES
        'scale-up': 'scaleUp 0.4s ease-out forwards',
        'scale-down': 'scaleDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        
        // SLIDES
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        
        // PULSES
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-fast': 'pulse 1.5s ease-in-out infinite',
        'pulse-primary': 'pulsePrimary 2s ease-in-out infinite',
        
        // OTHERS
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.8s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'glow-primary': 'glowPrimary 2s ease-in-out infinite',
        'glow-secondary': 'glowSecondary 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'rotate-in': 'rotateIn 0.4s ease-out',
        'rotate-out': 'rotateOut 0.4s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1.05)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulsePrimary: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(250, 49, 49, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(250, 49, 49, 0)' },
        },
        glowPrimary: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(250, 49, 49, 0.3)',
            borderColor: 'rgba(250, 49, 49, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(250, 49, 49, 0.6)',
            borderColor: 'rgba(250, 49, 49, 0.6)'
          },
        },
        glowSecondary: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(2, 72, 168, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(2, 72, 168, 0.6)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0)', opacity: '1' },
        },
        rotateOut: {
          '0%': { transform: 'rotate(0)', opacity: '1' },
          '100%': { transform: 'rotate(180deg)', opacity: '0' },
        },
      },
      
      // 📏 TRANSICIONES COMPLETAS
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      
      transitionDelay: {
        '0': '0ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
      
      // 📐 Z-INDEX
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '75': '75',
        '100': '100',
        'auto': 'auto',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal': '1040',
        'popover': '1050',
        'tooltip': '1060',
        'toast': '1070',
      },
      
      // 📏 OPACIDADES
      opacity: {
        '1': '0.01',
        '2': '0.02',
        '3': '0.03',
        '4': '0.04',
        '5': '0.05',
        '6': '0.06',
        '7': '0.07',
        '8': '0.08',
        '9': '0.09',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '35': '0.35',
        '40': '0.4',
        '45': '0.45',
        '50': '0.5',
        '55': '0.55',
        '60': '0.6',
        '65': '0.65',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '85': '0.85',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // 📏 BLUR
      blur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      
      // 📏 ALTURAS Y ANCHOS
      height: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-90': '90vh',
        'screen-nav': 'calc(100vh - 80px)',
      },
      
      minHeight: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-90': '90vh',
        'screen-nav': 'calc(100vh - 80px)',
      },
      
      maxHeight: {
        'screen-75': '75vh',
        'screen-80': '80vh',
        'screen-90': '90vh',
      },
      
      maxWidth: {
        'container': '1280px',
        'container-lg': '1440px',
        'container-xl': '1600px',
        'prose': '65ch',
      },
      
      // 🎨 BACKDROP BLUR
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      
      // 🖱️ CURSORES
      cursor: {
        'none': 'none',
        'grab': 'grab',
        'grabbing': 'grabbing',
        'zoom-in': 'zoom-in',
        'zoom-out': 'zoom-out',
      },
    },
  },
  
  // 🔌 PLUGINS
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'), // Opcional: más animaciones
  ],
}