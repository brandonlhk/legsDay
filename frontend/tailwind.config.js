/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {    
      colors: {
        "themeGreen" : "#00C9A7",
        "blueGreen" : "#476380",
        "tertGreen" : "#00967D",
        "blueGrey" : "#F5F7FA"
    }},

  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: ["light"]
  }
}