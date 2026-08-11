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
        brand: {
          primary: '#1E40AF',
          secondary: '#7C3AED',
          dark: '#0F172A',
        },
      },
      animation: {
        'pulse-alert': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sos-flash': 'flash 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
