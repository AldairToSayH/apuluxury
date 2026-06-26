import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        mineral: "#35605A",
        copper: "#B75D32",
        maize: "#F2C14E",
        cloud: "#F7F4EF",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 20, 18, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
