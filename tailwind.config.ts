import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: '0.75rem',
        md: '0.6rem',
        sm: '0.4rem'
      }
    }
  },
  plugins: []
} satisfies Config
