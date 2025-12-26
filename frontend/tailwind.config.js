/** @type {import('tailwindcss').Config} */

import { color } from 'framer-motion';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    // extend: {
    //   colors: {
    //     'color-surface-base': 'hsl(var(--color-surface-base))',
    //     'color-surface-muted': 'hsl(var(--color-surface-muted))',
    //     'color-surface-strong': 'hsl(var(--color-surface-strong))',
    //     'color-text-primary': 'hsl(var(--color-text-primary))',
    //     'color-accent-danger': 'hsl(var(--color-accent-danger))',
    //     'color-accent-success': 'hsl(var(--color-accent-success))',
    //     'color-highlight': 'hsl(var(--color-highlight))',
    //   }
    // },
  },
  plugins: [],
}