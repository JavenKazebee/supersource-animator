import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindcss, autoprefixer],
}