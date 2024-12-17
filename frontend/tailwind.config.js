/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
];
export const theme = {
  extend: {
    colors: {
      "themeGreen": "#00C9A7",
      "blueGreen": "#476380",
      "tertGreen": "#00967D",
      "blueGrey": "#F5F7FA"
    }
  },
};
export const plugins = [
  require('daisyui')
];
export const daisyui = {
  themes: ["light"]
};