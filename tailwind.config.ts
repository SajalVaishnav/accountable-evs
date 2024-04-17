import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-nib)'],
        mono: ['var(--font-fraktion)'],
        sans: ['var(--font-inter)'],
      },
      colors: {
        black: "#0B2447",
        darkest_blue: "19376D",
        mid_blue: "576CBC",
        light_blue: "A5D7E8",
      }
    },
  },
  plugins: [],
};
export default config;
