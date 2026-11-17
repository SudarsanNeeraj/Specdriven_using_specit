/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554'
        },
        clinical: {
          blue: '#2563eb',
          'blue-dark': '#1d4ed8',
          'blue-light': '#eff6ff',
          cyan: '#0284c7',
          teal: '#0d9488',
          'teal-light': '#f0fdfa',
          mint: '#10b981',
          porcelain: '#f8fafc',
          card: '#ffffff',
          slate: '#0f172a',
          'slate-sub': '#334155',
          'slate-muted': '#64748b',
          border: '#e2e8f0',
          'border-subtle': '#f1f5f9',
          amber: '#d97706',
          'amber-light': '#fffbeb',
          crimson: '#dc2626',
          'crimson-light': '#fef2f2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'clinical-md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'clinical-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
