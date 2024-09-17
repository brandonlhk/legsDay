/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {    
      colors: {
      'purple': '#9F5F91',
      "myYellow": "#F6EA98"
    }},

  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light"]
  }
}