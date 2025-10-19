/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Couleurs du design existant
        'rognon': {
          pink: '#f0c6da',
          dark: '#221f20',
          gray: '#666',
        },
        // Couleurs supplémentaires pour les bouchons
        'bouchon': {
          favorite: '#dc2626', // Rouge pour coups de coeur
          authentic: '#f59e0b', // Orange pour authentiques
          rating: '#fbbf24', // Jaune pour les étoiles
        }
      },
      fontFamily: {
        'gilton': ['GiltonRegular', 'Playfair Display', 'serif'],
        'sans': ['Open Sans', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'h1': '30px',
        'h2': '26px', 
        'h3': '22px',
        'h4': '18px',
        'h5': '16px',
        'h6': '14px',
      }
    },
  },
  plugins: [],
}

