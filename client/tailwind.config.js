/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#F8F6F1', // Primary background
          200: '#EFECE4',
          300: '#E7E3DA', // Subtle borders
          400: '#D5CFC3',
          500: '#B8B0A0',
        },
        charcoal: {
          900: '#141513',
          800: '#242521', // Primary text
          700: '#3A3B36',
          600: '#52544E',
          500: '#77776F', // Secondary text
          400: '#9B9B92',
          300: '#C2C2BB',
          200: '#E2E2DC',
          100: '#F1F1ED',
        },
        forest: {
          900: '#142E22',
          800: '#1E4433',
          700: '#285943', // Accent rich forest green
          600: '#347256',
          500: '#428E6C',
          100: '#E5EFE9',
          50: '#F1F7F3',
        },
        brick: {
          900: '#681B1C',
          700: '#9E2A2B', // Restrained brick red
          100: '#FAEAEC',
          50: '#FDF4F5',
        },
        sage: {
          900: '#1A4D30',
          700: '#2A7A4C', // Success muted green
          100: '#E6F4EB',
          50: '#F2FAF5',
        },
        amberGold: {
          700: '#B4691B',
          100: '#FDF4E7',
          50: '#FFF9F0',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 37, 33, 0.04)',
        'elevated': '0 4px 20px -2px rgba(36, 37, 33, 0.08)',
        'modal': '0 16px 36px -4px rgba(36, 37, 33, 0.16)',
      }
    },
  },
  plugins: [],
}
