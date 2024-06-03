
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-ens":
          "linear-gradient(330deg, #44BCF0 4.54%, #7298F8 59.2%, #A099FF 148.85%)",
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
}

