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
    <section className="border-b border-border bg-card/60">
      <div className="container-pal py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.whyTitle}</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-muted">
            {visible.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-3 text-sm font-semibold text-teal-dk hover:underline"
            >
              {expanded ? t.home.whyLess : t.home.whyMore}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
