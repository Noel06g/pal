"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/strings";

const CYCLE_MS = 3500;

/**
 * Itinerary-style step list (numbered red stamps joined by a dashed line).
 * Steps reveal one after another as the section scrolls into view, then the
 * highlight advances through them automatically; clicking a number jumps to
 * that step. Auto-advance is disabled under prefers-reduced-motion.
 */
export function HowItWorks() {
  const steps = t.home.how;
  const ref = useRef<HTMLOListElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);

  // Staggered reveal when the list enters the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance the highlighted step.
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % steps.length),
      CYCLE_MS,
    );
    return () => clearInterval(id);
  }, [visible, steps.length]);

  return (
    <ol ref={ref} className="mt-10 max-w-2xl">
      {steps.map((step, i) => {
        const isActive = i === active;
        const isLast = i === steps.length - 1;
        return (
          <li
            key={i}
            className={[
              "relative flex gap-5 transition-all duration-500",
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            ].join(" ")}
            style={{ transitionDelay: `${i * 200}ms` }}
          >
            {/* Number stamp + dashed connector, like a printed itinerary. */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center border text-sm font-bold transition-colors duration-500",
                  isActive
                    ? "border-stamp bg-stamp text-white"
                    : "border-stamp bg-paper text-stamp",
                ].join(" ")}
              >
                {i + 1}
              </button>
              {!isLast && (
                <span
                  aria-hidden
                  className="my-1.5 w-px flex-1 border-l border-dashed border-stamp/60"
                />
              )}
            </div>
            <div
              className={[
                isLast ? "pb-0" : "pb-9",
                "transition-opacity duration-500",
                isActive ? "opacity-100" : "opacity-55",
              ].join(" ")}
            >
              {step.title ? (
                <>
                  <h3 className="text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed text-ink">
                    {step.body}
                  </p>
                </>
              ) : (
                <p className="pt-1.5 text-base leading-relaxed text-ink">
                  {step.body}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
