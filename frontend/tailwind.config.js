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
          DEFAULT: '#F8F7F3',
          50: '#FDFCFB',
          100: '#F8F7F3',
          200: '#F1EFE8',
        },
        surface: '#FFFFFF',
        royal: {
          DEFAULT: '#4169E1',
          hover: '#3454B4',
          light: '#EEF2FF',
          border: '#C7D2FE',
          dark: '#2A4391',
        },
        modernPurple: {
          DEFAULT: '#7656D6',
          hover: '#6242BF',
          light: '#F5F3FF',
          border: '#DDD6FE',
        },
        tealGov: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#F0FDFA',
          border: '#99F6E4',
        },
        softOrange: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FFFBEB',
          border: '#FDE68A',
        },
        emeraldGov: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          light: '#F0FDF4',
          border: '#BBF7D0',
        },
        rosePink: {
          DEFAULT: '#E85D9E',
          hover: '#D04586',
          light: '#FDF2F8',
          border: '#FBCFE8',
        },
        charcoal: {
          DEFAULT: '#252B36',
          muted: '#64748B',
          dark: '#1A1E26',
        },
        warmgrey: {
          DEFAULT: '#E9E7E1',
          light: '#F3F2ED',
          border: '#E9E7E1',
        },
        neutralBorder: '#E9E7E1',
        governance: {
          50: '#F8F7F3',
          100: '#F1EFE8',
          200: '#E9E7E1',
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
