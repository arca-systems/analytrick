import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Analytrick design system
        brand: {
          DEFAULT: '#ffe600',
          dark:    '#e6cf00',
        },
        surface: {
          DEFAULT: '#0f1117',
          raised:  '#161b25',
          border:  '#1e2535',
          hover:   '#1a2133',
        },
        text: {
          primary:   '#f1f5f9',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
        accent: {
          green:  '#4ade80',
          red:    '#ef4444',
          blue:   '#60a5fa',
          purple: '#a78bfa',
          orange: '#fb923c',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
