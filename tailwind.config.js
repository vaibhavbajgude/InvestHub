/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#6366f1',
          dark: '#818cf8',
        },
        accent: '#f59e0b',
        success: '#10b981',
        error: '#ef4444',
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
