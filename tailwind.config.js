/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*',
  ],
  safelist: [
    { pattern: /.*/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'sans': ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Colores corporativos RedOak
        'redoak-blue': '#009FE3',      // Pantone 299 C
        'redoak-blue-dark': '#00628B', // Pantone 7469 C
        'redoak-orange': '#EA5B1B',    // Pantone 7579 C
        'redoak-gray': '#706F6F',      // Pantone 424 C
        // Alias para uso rápido
        'primary': '#EA5B1B',          // Naranja principal
        'primary-light': '#F7C6A4', // Naranja claro (hover, fondo)
        'primary-dark': '#B9430B',  // Naranja oscuro (active, border)
        'secondary': '#009FE3',     // Azul claro
        'secondary-light': '#B3E7FB', // Azul claro suave
        'secondary-dark': '#0070A3',  // Azul claro oscuro
        'accent': '#00628B',         // Azul oscuro
        'accent-light': '#7EC5E6',   // Azul oscuro claro
        'accent-dark': '#003D5A',    // Azul oscuro profundo
        'muted': '#706F6F',          // Gris para textos y fondos suaves
        'white': '#FFFFFF',
      },
    },
  },
  plugins: [],
};