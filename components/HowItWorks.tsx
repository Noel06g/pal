"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/strings";

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
    <div className="hidden sm:mt-5 sm:block" aria-hidden>
      <svg viewBox="0 0 64 28" width="56" height="24" fill="none">
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
            <path d="M0 0L10 5L0 10z" fill="#871D1D" />
          </marker>
        </defs>
        <path
          d="M2 22C18 22 22 6 60 6"
          stroke="#871D1D"
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
export function HowItWorks() {
  const steps = t.home.how;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <div
      ref={ref}
      role="list"
      aria-label={t.home.howTitle}
      className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start sm:gap-x-2 sm:gap-y-0"
    >
      {steps.map((step, i) => {
        const Icon = ICONS[i]!;
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
              <span className="flex h-16 w-16 shrink-0 items-center justify-center border border-ink text-ink">
                <Icon className="h-8 w-8" />
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
