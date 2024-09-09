import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        grey: {
          50: 'var(--grey-0)',
          100: 'var(--grey-1)',
          200: 'var(--grey-2)',
          300: 'var(--grey-3)',
          400: 'var(--grey-4)',
          500: 'var(--grey-5)',
          600: 'var(--grey-6)',
          700: 'var(--grey-7)',
          800: 'var(--grey-8)',
          900: 'var(--grey-9)',
          950: 'var(--grey-11)',
          1000: 'var(--grey-12)',
        }

      },
    },
  },
  plugins: [],
};

export default config;