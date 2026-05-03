export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        'primary-light': '#dbeafe',
        surface: '#f8fafc',
        'surface-dark': '#f1f5f9',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        accent: '#3b82f6',
        card: '#ffffff',
      },
      boxShadow: {
        soft: '0 10px 40px rgba(37, 99, 235, 0.1), 0 4px 20px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px rgba(37, 99, 235, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
