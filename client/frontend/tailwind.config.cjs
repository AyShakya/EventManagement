/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"   // <-- must include your src files
  ],
  theme: {
    extend: {
      colors: {
        'coffee-dark': "#561C24",
        'coffee-mid':  "#6D2932",
        'coffee-sand': "#C7B7A3",
        'coffee-cream':"#E8DBC4"
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
