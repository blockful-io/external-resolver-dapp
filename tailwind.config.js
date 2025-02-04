/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-satoshi)"],
      },
      backgroundImage: {
        "gradient-ens":
          "linear-gradient(330deg, #44BCF0 4.54%, #7298F8 59.2%, #A099FF 148.85%)",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        fadeIn: "fadeIn 1s linear forwards",
      },
      blur: {
        custom: "125px",
      },
      borderRadius: {
        ellipse: "50% / 25%",
      },
    },
  },
  plugins: [],
};
