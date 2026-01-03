/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // <--- ISSO É O IMPORTANTE PARA O BOTÃO FUNCIONAR
  theme: {
    extend: {},
  },
  plugins: [],
};
