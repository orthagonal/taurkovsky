const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: ["../ui/**/*.{html,js}"],
  purge: ['./src/**/*.html']
};