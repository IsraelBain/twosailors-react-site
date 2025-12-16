/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "serif"], // Headings
        sans: ["Inter", "sans-serif"], // Body & Navbar
        mont: ["Montserrat", "sans-serif"], // Buttons/UI
      },
      colors: {
        // Brand colors from logo
        coral: {
          DEFAULT: "#E85A4F",
          light: "#F07167",
          dark: "#D64545",
        },
        cream: {
          DEFAULT: "#FAF1E6",
          dark: "#F5E6D3",
        },
        navy: {
          DEFAULT: "#1a3a5c",
          light: "#2a4a6c",
          dark: "#0C2340",
        },
      },
    },
  },
  plugins: [],
};
