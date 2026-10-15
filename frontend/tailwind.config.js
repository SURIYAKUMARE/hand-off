/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: '#FFFFFF',
        border: '#E4E7EC',
        brand: {
          DEFAULT: '#3B3FD9',
          hover: '#2F32B5',
          light: '#EEF0FD',
          active: '#24278F',
        },
        text: {
          primary: '#101828',
          secondary: '#475467',
          muted: '#667085',
        },
        priority: {
          urgent: '#D92D20',
          high: '#F79009',
          medium: '#2E90FA',
          low: '#667085',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
      },
      boxShadow: {
        dropdown: '0px 4px 12px rgba(16, 24, 40, 0.08), 0px 2px 4px rgba(16, 24, 40, 0.04)',
        modal: '0px 12px 24px -4px rgba(16, 24, 40, 0.12), 0px 4px 8px -2px rgba(16, 24, 40, 0.06)',
        toast: '0px 8px 16px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -1px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};
