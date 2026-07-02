import type { Config } from "tailwindcss";

/**
 * Document-style design system ("printed monograph"):
 * paper white canvas, ink text, warm hairline borders, underlined indigo
 * links, a pure-blue square stamp as the only brand mark. No radii, no
 * shadows, no webfonts. Chromatic color is reserved for illustration.
 *
 * Legacy token names (teal/paper/card/…) are kept and remapped so existing
 * component classes pick up the new system without churn:
 *   teal      → indigo link  (#555abf)
 *   teal-dk   → stamp blue   (#0000ff)  — hover/active end of the link family
 *   teal-tint → paper-warm wash
 *   danger    → ember        (#eb5e28)
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
        ink: "#222222",
        paper: "#FFFFFF",
        card: "#FFFFFF",
        border: "#D8D4CF",
        muted: "#555555",
        teal: {
          DEFAULT: "#555ABF",
          dk: "#0000FF",
          tint: "#F5F4F0",
        },
        stamp: "#0000FF",
        danger: {
          DEFAULT: "#EB5E28",
          tint: "#FDEFE8",
        },
        ok: "#222222",
        amber: "#9A6B16",
        // Illustration-only palette (never for UI chrome).
        cobalt: "#276BAA",
        sky: "#2181C2",
        navy: "#000080",
        amberflow: "#FCD669",
        tangerine: "#F79A59",
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
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
        // Elevation is expressed with hairline borders, never shadows.
        card: "none",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
