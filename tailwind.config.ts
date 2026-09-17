import type { Config } from "tailwindcss";

// Paleta "tierra" — Barker / Grupo Albar
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        albar: {
          900: "#241812",
          800: "#3A2A1D",
          700: "#5C4430",
          600: "#8A5A2B",
          500: "#B07C4F",
          300: "#D9C4A8",
          200: "#E8DCC8",
          100: "#F5EFE4",
          50: "#FBF8F3"
        },
        estado: {
          activo: "#4C7A3A",
          alerta: "#B85C2B",
          riesgo: "#B03A2E"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
