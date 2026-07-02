/**
 * Signature illustration — the single moment of chromatic abundance the
 * design system permits. Stacked blue gradient blocks (ideas/institutions)
 * with two flowing arrows weaving upward through them (citizens & experts
 * moving ideas forward). Pure content, not UI chrome.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustrim: ide që lëvizin përpara"
    >
      <defs>
        <linearGradient id="blk1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2181C2" />
          <stop offset="1" stopColor="#276BAA" />
        </linearGradient>
        <linearGradient id="blk2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#276BAA" />
          <stop offset="1" stopColor="#000080" />
        </linearGradient>
        <linearGradient id="blk3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2181C2" />
          <stop offset="1" stopColor="#000080" />
        </linearGradient>
        <marker
          id="tipAmber"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="#FCD669" />
        </marker>
        <marker
          id="tipTangerine"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10z" fill="#F79A59" />
        </marker>
      </defs>

      {/* Navy drop shadows (content shadow, not UI elevation) */}
      <rect x="196" y="66" width="132" height="76" fill="#000080" />
      <rect x="128" y="146" width="132" height="76" fill="#000080" />
      <rect x="60" y="226" width="132" height="76" fill="#000080" />

      {/* Gradient blocks, stepping diagonally upward */}
      <rect x="188" y="58" width="132" height="76" fill="url(#blk1)" />
      <rect x="120" y="138" width="132" height="76" fill="url(#blk3)" />
      <rect x="52" y="218" width="132" height="76" fill="url(#blk2)" />

      {/* Flowing arrows sweeping lower-left → upper-right */}
      <path
        d="M20 330 C 90 320, 120 260, 150 210 S 230 110, 305 76"
        stroke="#FCD669"
        strokeWidth="7"
        strokeLinecap="round"
        markerEnd="url(#tipAmber)"
      />
      <path
        d="M60 344 C 150 336, 190 280, 216 236 S 280 150, 336 118"
        stroke="#F79A59"
        strokeWidth="5"
        strokeLinecap="round"
        markerEnd="url(#tipTangerine)"
      />
    </svg>
  );
}
