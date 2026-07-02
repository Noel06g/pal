"use client";

import { useState } from "react";
import { t } from "@/lib/strings";

// Number of paragraphs shown before the "read more" toggle.
const VISIBLE = 2;

export function WhySection() {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = t.home.why;
  const visible = expanded ? paragraphs : paragraphs.slice(0, VISIBLE);
  const hasMore = paragraphs.length > VISIBLE;

  return (
    <section className="container-pal py-20 sm:py-28">
      <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {t.home.whyTitle}
      </h2>
      <div className="prose-col mt-6 space-y-4 text-lg leading-relaxed text-ink">
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
