import type { Config } from "tailwindcss";

/**
 * Document-style design system ("printed monograph"), Albanian palette:
 * cream paper canvas, ink text, warm hairline borders, underlined deep-red
 * links, a flag-red square stamp as the only brand mark. No radii, no
 * shadows, no webfonts. Chromatic color is reserved for illustration.
 *
 * Legacy token names (teal/paper/card/…) are kept and remapped so existing
 * component classes pick up the new system without churn:
 *   teal      → brand red (#871d1d, sampled from the logo)
 *   teal-dk   → darker red (#5e1112) — hover/active end of the link family
 *   teal-tint → warm red wash
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
        ink: "#1C1917",
        paper: "#F4EFE6",
        card: "#FBF8F1",
        border: "#DCD5C6",
        muted: "#6B6459",
        teal: {
          DEFAULT: "#871D1D",
          dk: "#5E1112",
          tint: "#F3E4DD",
        },
        stamp: "#871D1D",
        danger: {
          DEFAULT: "#EB5E28",
          tint: "#FDEFE8",
        },
        ok: "#1C1917",
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
