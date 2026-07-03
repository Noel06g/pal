"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/strings";

// Number of paragraphs shown before the "read more" toggle.
const VISIBLE = 2;

export function WhySection() {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const paragraphs = t.home.why;
  const visible = expanded ? paragraphs : paragraphs.slice(0, VISIBLE);
  const hasMore = paragraphs.length > VISIBLE;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="container-pal py-20 sm:py-28">
      <h2
        className={[
          "text-balance text-3xl font-bold leading-tight tracking-tight transition-all duration-700 sm:text-4xl",
          revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        {t.home.whyTitle}
      </h2>
      <div
        className={[
          "prose-col mt-6 space-y-4 text-lg leading-relaxed text-ink transition-all duration-700",
          revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
        style={{ transitionDelay: "120ms" }}
      >
        {visible.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="link-underline mt-4 text-base font-medium"
        >
          {expanded ? t.home.whyLess : t.home.whyMore}
        </button>
      )}
    </section>
  );
}
