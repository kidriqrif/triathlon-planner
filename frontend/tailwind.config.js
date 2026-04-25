/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', '"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        sport: {
          swim:  '#3b82f6',
          bike:  '#f97316',
          run:   '#10b981',
          gym:   '#ec4899',
          brick: '#8b5cf6',
        },
        sunrise: {
          start: '#ff7a00',
          end:   '#ff0080',
        },
      },
      backgroundImage: {
        'sunrise-gradient':  'linear-gradient(135deg, #ff7a00 0%, #ff0080 100%)',
        'sunrise-subtle':    'linear-gradient(135deg, rgba(255,122,0,0.15) 0%, rgba(255,0,128,0.15) 100%)',
        'sunrise-radial':    'radial-gradient(circle at 30% 30%, #ff7a00, #ff0080)',
      },
      boxShadow: {
        'surface':        '0 4px 24px -1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'surface-raised': '0 12px 40px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-sunrise':   '0 0 20px rgba(255,122,0,0.25)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSunrise: {
          '0%':   { boxShadow: '0 0 0 0 rgba(255,122,0,0.4)' },
          '70%':  { boxShadow: '0 0 0 6px rgba(255,122,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,122,0,0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up':       'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-sunrise': 'pulseSunrise 2s infinite',
        'float':         'floatY 6s cubic-bezier(0.25,1,0.5,1) infinite',
        'float-slow':    'floatY 8s cubic-bezier(0.25,1,0.5,1) infinite 2s',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
