"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/strings";

// Three shades of the brand red — stays on the single-color identity
// instead of pulling in unrelated hues.
const STEP_COLORS = [
  { fg: "#B71C1C", bg: "rgba(183,28,28,0.08)" },
  { fg: "#D32F2F", bg: "rgba(211,47,47,0.08)" },
  { fg: "#F44336", bg: "rgba(244,67,54,0.10)" },
];

function IdeaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="9" y="6" width="18" height="24" />
      <path d="M13 12h10M13 17h10M13 22h6" />
      <path d="M24.5 25.5l6.5-6.5 3 3-6.5 6.5h-3v-3z" />
    </svg>
  );
}

function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M8 9h24a3 3 0 013 3v10a3 3 0 01-3 3H19l-6 6v-6h-5a3 3 0 01-3-3V12a3 3 0 013-3z" />
      <circle cx="15" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="17" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="25" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 11L10 17M20 11l10 6M10 17v11M30 17v11M10 28l10 6M30 28l-10 6" />
      <circle cx="20" cy="11" r="3" />
      <circle cx="10" cy="17" r="3" />
      <circle cx="30" cy="17" r="3" />
      <circle cx="10" cy="28" r="3" />
      <circle cx="30" cy="28" r="3" />
      <circle cx="20" cy="34" r="3" />
    </svg>
  );
}

const ICONS = [IdeaIcon, CommunityIcon, NetworkIcon];

/** Curved connector arrow between two steps; its stroke draws in once visible. */
function StepArrow({
  show,
  delayMs,
  markerId,
}: {
  show: boolean;
  delayMs: number;
  markerId: string;
}) {
  return (
    <div className="hidden sm:block" style={{ marginTop: 39 }} aria-hidden>
      <svg viewBox="0 0 64 28" width="76" height="34" fill="none">
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="4.5"
            markerHeight="4.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill="#B71C1C" />
          </marker>
        </defs>
        <path
          d="M2 22C18 22 22 6 60 6"
          stroke="#B71C1C"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd={`url(#${markerId})`}
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: show ? 0 : 1,
            transition: `stroke-dashoffset 700ms ease ${delayMs}ms`,
          }}
        />
      </svg>
    </div>
  );
}

/**
 * Three-step icon diagram (idea → community → experts), connected by
 * hand-drawn arrows in the stamp red. Icons and arrows stagger into view
 * as the section scrolls into the viewport.
 */
// Time for the last icon/arrow to finish revealing, plus a pause before
// the whole sequence resets and replays.
const REVEAL_MS = 2 * 220 + 900;
const HOLD_MS = 2200;
const RESET_MS = 500;

export function HowItWorks() {
  const steps = t.home.how;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);

  // Track whether the section is on screen; the reveal loop only runs
  // while it is, so it doesn't animate forever off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(!!entry?.isIntersecting),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Loop the stagger: reveal, hold, briefly reset, repeat.
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const cycle = (show: boolean) => {
      setVisible(show);
      timeoutId = setTimeout(() => {
        if (!cancelled) cycle(!show);
      }, show ? REVEAL_MS + HOLD_MS : RESET_MS);
    };
    cycle(true);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      role="list"
      aria-label={t.home.howTitle}
      className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start sm:gap-x-2 sm:gap-y-0"
    >
      {steps.map((step, i) => {
        const Icon = ICONS[i]!;
        const color = STEP_COLORS[i]!;
        return (
          <div className="contents" key={i}>
            <div
              role="listitem"
              className={[
                "flex max-w-xs flex-col items-start gap-4 transition-all duration-500",
                visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              ].join(" ")}
              style={{ transitionDelay: `${i * 220}ms` }}
            >
              <span
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border shadow-card transition-transform duration-300 hover:scale-105"
                style={{
                  borderColor: color.fg,
                  backgroundColor: color.bg,
                  color: color.fg,
                }}
              >
                <Icon className="h-14 w-14" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-base leading-relaxed text-ink">
                  {step.body}
                </p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <StepArrow
                show={visible}
                delayMs={i * 220 + 150}
                markerId={`how-arrow-${i}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
