import { FIELDS } from "./fields";

export type FieldColor = {
  /** Deep, saturated — text, icons, active accents. */
  fg: string;
  /** Medium-alpha wash — resting border. */
  border: string;
  /** Low-alpha wash — resting background tint. */
  bg: string;
  /** Higher-alpha wash — hover/active background tint. */
  bgHover: string;
};

// 14 hues spread across a 300° arc, leaving a 60° gap centered on the brand
// stamp red (~0°) so field colors never compete with the one brand mark.
const HUE_START = 30;
const HUE_SPAN = 300;

function hueFor(index: number, total: number): number {
  return HUE_START + (index * HUE_SPAN) / (total - 1);
}

const COLORS: Record<string, FieldColor> = Object.fromEntries(
  FIELDS.map((f, i) => {
    const h = hueFor(i, FIELDS.length);
    return [
      f.key,
      {
        fg: `hsl(${h} 55% 30%)`,
        border: `hsl(${h} 45% 40% / 45%)`,
        bg: `hsl(${h} 45% 40% / 8%)`,
        bgHover: `hsl(${h} 45% 40% / 16%)`,
      } satisfies FieldColor,
    ];
  }),
);

const FALLBACK: FieldColor = {
  fg: "#6B6459",
  border: "#DCD5C6",
  bg: "transparent",
  bgHover: "transparent",
};

/** Field-keyed accent color. Falls back to a neutral for "other"/unknown keys. */
export function fieldColor(key: string): FieldColor {
  return COLORS[key] ?? FALLBACK;
}
