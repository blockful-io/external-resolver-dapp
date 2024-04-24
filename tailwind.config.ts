import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-ens":
          "linear-gradient(330deg, #44BCF0 4.54%, #7298F8 59.2%, #A099FF 148.85%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
export default config;
