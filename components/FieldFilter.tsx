"use client";

import { useState } from "react";
import Link from "next/link";
import { FIELDS, OTHER_FIELD, fieldName } from "@/lib/fields";
import { t } from "@/lib/strings";

/**
 * Field filter for the ideas list.
 * - Desktop (lg+): always-visible sidebar list (unchanged).
 * - Mobile: a "Filtro sipas fushës" button that toggles the list open.
 */
export function FieldFilter({
  activeField,
  q,
}: {
  activeField: string | null;
  q: string;
}) {
  const [open, setOpen] = useState(false);

  const filterHref = (key: string | null) => {
    const params = new URLSearchParams();
    if (key) params.set("fusha", key);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/idete${qs ? `?${qs}` : ""}`;
  };

  const currentLabel = activeField ? fieldName(activeField) : t.ideas.filterAll;

  const itemClass = (active: boolean) =>
    [
      "block rounded-md px-3 py-2 text-sm leading-snug",
      active ? "bg-teal-tint font-semibold text-teal-dk" : "text-ink hover:bg-teal-tint",
    ].join(" ");

  return (
    <div>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[10px] border border-border bg-card px-4 py-3 text-sm font-semibold text-ink lg:hidden"
      >
        <span>
          {t.ideas.filterButton}
          <span className="ml-2 font-normal text-muted">· {currentLabel}</span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The list: collapsible on mobile, always shown on desktop */}
      <div className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
        <h2 className="mb-3 hidden text-sm font-bold uppercase tracking-wide text-muted lg:block">
          {t.ideas.filterTitle}
        </h2>
        <ul className="space-y-1">
          <li>
            <Link href={filterHref(null)} onClick={() => setOpen(false)} className={itemClass(!activeField)}>
              {t.ideas.filterAll}
            </Link>
          </li>
          {FIELDS.map((f) => (
            <li key={f.key}>
              <Link
                href={filterHref(f.key)}
                onClick={() => setOpen(false)}
                className={itemClass(activeField === f.key)}
              >
                {f.n}. {f.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={filterHref(OTHER_FIELD.key)}
              onClick={() => setOpen(false)}
              className={itemClass(activeField === OTHER_FIELD.key)}
            >
              {OTHER_FIELD.name}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
