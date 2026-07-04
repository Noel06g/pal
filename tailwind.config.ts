import type { Config } from "tailwindcss";

/**
 * Modern crimson design system: clean off-white canvas, near-black text,
 * soft rounded surfaces, layered shadows for depth, a bold filled crimson
 * as the primary action color.
 *
 * Legacy token names (teal/paper/card/…) are kept and remapped so existing
 * component classes pick up the new system without churn:
 *   teal      → primary crimson (#b71c1c)
 *   teal-dk   → secondary red (#d32f2f) — hover/active end of the link family
 *   teal-tint → warm red wash
 *   danger    → accent highlight red (#f44336)
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#F8F8F8",
        card: "#FFFFFF",
        border: "#EAEAEA",
        muted: "#6B6B6B",
        teal: {
          DEFAULT: "#B71C1C",
          dk: "#D32F2F",
          tint: "#F6DFDF",
        },
        stamp: "#B71C1C",
        danger: {
          DEFAULT: "#F44336",
          tint: "#FDE8E6",
        },
        ok: "#111111",
        amber: "#9A6B16",
      },
      borderRadius: {
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      fontFamily: {
        // The system stack IS the brand voice — no webfonts.
        display: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Warm, low-contrast shadows — depth without looking heavy.
        soft: "0 1px 2px rgba(17,17,17,0.05)",
        card: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -8px rgba(17,17,17,0.10)",
        lift: "0 16px 32px -12px rgba(183,28,28,0.28)",
        nav: "0 1px 3px rgba(17,17,17,0.05), 0 4px 16px -8px rgba(17,17,17,0.08)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
