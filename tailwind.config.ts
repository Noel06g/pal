import type { Config } from "tailwindcss";

/**
 * Document-style design system ("printed monograph"), crimson palette:
 * clean off-white canvas, near-black text, neutral-gray hairline borders,
 * underlined crimson links, a red square stamp as the only brand mark.
 * No radii, no shadows, no webfonts. Chromatic color is reserved for
 * illustration.
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
