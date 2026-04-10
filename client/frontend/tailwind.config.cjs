/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"   
  ],
  theme: {
    extend: {
      colors: {
        'coffee-dark': "#2A1812",
        'coffee-mid':  "#8A5A3B",
        'coffee-sand': "#D7C4AE",
        'coffee-cream':"#F2E8DA"
      },
      borderRadius: {
        'xl-4': '1.5rem'
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'), 
  ],
}
