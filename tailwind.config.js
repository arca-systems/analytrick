/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Extensão dark theme colors
        bg:       '#111827',
        hbg:      '#1f2937',
        brd:      '#374151',
        brd2:     '#2d3748',
        txt:      '#f9fafb',
        'txt-m':  '#9ca3af',
        'txt-d':  '#6b7280',
        'txt-vd': '#4b5563',
        hover:    '#1e3a5f',
        row:      '#111827',
        'row-alt':'#1a2234',
        h1bg:     '#1a2035',
        h2bg:     '#111827',
        accent:   '#ffe600',
        blue:     '#2563eb',
        'blue-d': '#1d4ed8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
