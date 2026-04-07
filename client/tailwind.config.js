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
    extend: {},
  },
  plugins: [gluestackPlugin],
};
