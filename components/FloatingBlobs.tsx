type Blob = {
  color: string;
  top: string;
  left: string;
  size: number;
  anim: "animate-blob-a" | "animate-blob-b";
};

const DEFAULT_BLOBS: Blob[] = [
  { color: "#B71C1C", top: "-10%", left: "62%", size: 420, anim: "animate-blob-a" },
  { color: "#F44336", top: "40%", left: "-8%", size: 320, anim: "animate-blob-b" },
  { color: "#E8A33D", top: "10%", left: "18%", size: 260, anim: "animate-blob-a" },
  { color: "#2F8F7A", top: "55%", left: "78%", size: 300, anim: "animate-blob-b" },
];

/**
 * Soft, blurred color blobs that drift slowly behind content — decorative
 * "life" for section backgrounds. Purely visual: pointer-events-none,
 * aria-hidden, and respects prefers-reduced-motion via the global override.
 */
export function FloatingBlobs({
  blobs = DEFAULT_BLOBS,
  opacity = 0.16,
}: {
  blobs?: Blob[];
  opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${b.anim}`}
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            backgroundColor: b.color,
            opacity,
            filter: "blur(70px)",
          }}
        />
      ))}
    </div>
  );
}
