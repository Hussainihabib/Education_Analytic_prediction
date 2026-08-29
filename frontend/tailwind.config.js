/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b1526',
          900: '#0f172a',
          800: '#132038',
          700: '#1a2b4a',
          600: '#22385f',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f8f4ec',
          200: '#f1ebdd',
        },
        amber: {
          accent: '#d98e3f',
        },
        teal: {
          accent: '#3fb8a8',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 6px -1px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
}
