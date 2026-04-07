const nativewindPreset = require('nativewind/preset');
const plugin = require('tailwindcss/plugin');

const stateWeights = {
  'indeterminate=true': 1,
  'indeterminate=false': 1,
  'checked=true': 1,
  'checked=false': 1,
  'read-only=true': 1,
  'read-only=false': 1,
  'flip=true': 1,
  'flip=false': 1,
  'required=true': 2,
  'required=false': 2,
  'invalid=true': 2,
  'invalid=false': 2,
  'focus=true': 3,
  'focus=false': 3,
  'focus-visible=true': 4,
  'focus-visible=false': 4,
  'hover=true': 5,
  'hover=false': 5,
  'pressed=true': 6,
  'pressed=false': 6,
  'active=true': 6,
  'active=false': 6,
  'loading=true': 7,
  'loading=false': 7,
  'disabled=true': 10,
  'disabled=false': 10,
};

const gluestackPlugin = plugin(({ matchVariant }) => {
  matchVariant(
    'data',
    (value) => {
      if (!value.includes('=')) {
        return '&';
      }

      const [state, stateValue] = value.split('=');
      return `&[data-${state}="${stateValue}"]`;
    },
    {
      sort(a, z) {
        return (stateWeights[a?.value] || 0) - (stateWeights[z?.value] || 0);
      },
    }
  );
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './providers/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './store/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [nativewindPreset],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '22px' }],
        lg: ['18px', { lineHeight: '24px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '30px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '42px' }],
        '5xl': ['48px', { lineHeight: '54px' }],
        '6xl': ['60px', { lineHeight: '66px' }],
      },
      colors: {
        hearth: {
          surface: '#111316',
          'surface-low': '#161A1E',
          'surface-container': '#1B1F23',
          'surface-high': '#252A30',
          'surface-highest': '#2E343B',
          text: '#E2E2E6',
          subtext: '#B6A39E',
          primary: '#F06539',
          'primary-soft': '#FFB59F',
          amber: '#FFD799',
          danger: '#FFB3AC',
          outline: 'rgba(162, 124, 112, 0.15)',
        },
      },
      borderRadius: {
        hearth: '24px',
      },
      boxShadow: {
        hearth: '0 16px 48px rgba(42, 18, 11, 0.08)',
        'hearth-soft': '0 12px 32px rgba(42, 18, 11, 0.06)',
      },
      letterSpacing: {
        editorial: '0.8px',
      },
    },
  },
  plugins: [gluestackPlugin],
};
