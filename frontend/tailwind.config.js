/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F8F6F0',
          50: '#FDFCF9',
          100: '#F8F6F0',
          200: '#F0EDE5',
        },
        surface: '#FFFFFF',
        royal: {
          DEFAULT: '#4169E1',
          hover: '#3454B4',
          light: '#EEF2FF',
          border: '#C7D2FE',
          dark: '#2A4391',
        },
        charcoal: {
          DEFAULT: '#252B36',
          muted: '#64748B',
          dark: '#1A1E26',
        },
        warmgrey: {
          DEFAULT: '#E8E4DA',
          light: '#F0EDE5',
          border: '#E8E4DA',
        },
        governance: {
          50: '#F8F6F0',
          100: '#F0EDE5',
          200: '#E8E4DA',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#252B36',
          900: '#1A1E26',
          950: '#0F131A',
        },
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        emeraldGov: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#16A34A',
          600: '#059669',
          700: '#047857',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
