import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#f4efe8',
        gold: '#c9a96e',
        'gold-muted': '#d9c59d',
        charcoal: '#050505',
      },
      letterSpacing: { luxury: '0.28em' },
      fontFamily: { serif: ['Georgia', 'Times New Roman', 'serif'] },
    },
  },
  plugins: [],
};

export default config;
