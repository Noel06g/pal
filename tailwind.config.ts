import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A2230",
        paper: "#F1F2EE",
        card: "#FFFFFF",
        teal: {
          DEFAULT: "#13615C",
          dk: "#0E4D49",
          tint: "#E6EFEC",
        },
        border: "#E1E2DD",
        muted: "#5C6672",
        danger: {
          DEFAULT: "#A33A3A",
          tint: "#F4E8E8",
        },
        ok: "#2E7D52",
        amber: "#9A6B16",
      },
      borderRadius: {
        DEFAULT: "14px",
        lg: "14px",
        xl: "18px",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,34,48,0.04), 0 8px 24px rgba(26,34,48,0.06)",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
