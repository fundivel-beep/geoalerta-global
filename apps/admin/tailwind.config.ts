import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        alert: {
          red: '#DC2626',
          orange: '#EA580C',
          yellow: '#CA8A04',
          green: '#16A34A',
          gray: '#6B7280',
        },
      },
    },
  },
  plugins: [],
};

export default config;
