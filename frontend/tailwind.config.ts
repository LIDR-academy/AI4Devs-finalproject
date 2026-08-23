import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        principiante: "#4A90D9",
        basico: "#50C878",
        intermedio: "#F5A623",
        avanzado: "#E67E22",
        experto: "#E74C3C",
      },
    },
  },
  plugins: [],
} satisfies Config;
