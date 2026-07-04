"use client";

const NODES = [
  { cx: 100, cy: 40, r: 15, color: "#B71C1C" },
  { cx: 40, cy: 90, r: 11, color: "#D32F2F" },
  { cx: 160, cy: 95, r: 11, color: "#E8A33D" },
  { cx: 60, cy: 160, r: 9, color: "#2F8F7A" },
  { cx: 140, cy: 165, r: 9, color: "#F44336" },
  { cx: 100, cy: 205, r: 13, color: "#B71C1C" },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 5],
  [1, 2],
];

/**
 * Community-network figure for the "Pse Platforma Shqiptare?" section —
 * citizens and experts (nodes) linked by lines that draw in once visible,
 * in a small spread of warm accent colors alongside the brand crimson.
 */
export function WhyIllustration({
  className,
  visible,
}: {
  className?: string;
  visible: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustrim: rrjet qytetarësh dhe ekspertësh të lidhur"
    >
      {EDGES.map(([a, b], i) => {
        const na = NODES[a]!;
        const nb = NODES[b]!;
        return (
          <path
            key={i}
            d={`M${na.cx} ${na.cy} L${nb.cx} ${nb.cy}`}
            stroke="#B71C1C"
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: visible ? 0 : 1,
              transition: `stroke-dashoffset 900ms ease ${i * 80}ms`,
            }}
          />
        );
      })}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill={n.color}
          className="animate-float-y"
          style={{
            transformOrigin: `${n.cx}px ${n.cy}px`,
            animationDelay: `${i * 260}ms`,
            opacity: visible ? 1 : 0,
            transition: `opacity 500ms ease ${i * 80}ms`,
          }}
        />
      ))}
    </svg>
  );
}
