/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          hover: 'var(--surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        brand: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          active: 'var(--accent-active)',
          light: 'var(--accent-light)',
          muted: 'var(--accent-muted)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-tertiary)',
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          border: 'var(--sidebar-border)',
        },
        header: {
          bg: 'var(--header-bg)',
          border: 'var(--header-border)',
        },
        card: {
          bg: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        priority: {
          urgent: '#DC4545',
          high: '#E9A23B',
          medium: '#175CD3',
          low: 'var(--text-tertiary)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        dropdown: '0px 4px 16px rgba(17, 24, 39, 0.12), 0px 2px 4px rgba(17, 24, 39, 0.06)',
        modal: '0px 16px 32px -4px rgba(17, 24, 39, 0.2), 0px 4px 12px -2px rgba(17, 24, 39, 0.1)',
        toast: '0px 10px 20px -2px rgba(17, 24, 39, 0.15), 0px 4px 8px -1px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
