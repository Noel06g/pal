"use client";

import { FIELDS } from "@/lib/fields";
import { t } from "@/lib/strings";

/** Pick 1–3 areas (field keys) as toggle chips. */
export function AreaPicker({
  value,
  onChange,
  max = 3,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  function toggle(key: string) {
    if (value.includes(key)) onChange(value.filter((k) => k !== key));
    else if (value.length < max) onChange([...value, key]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {FIELDS.map((f) => {
          const active = value.includes(f.key);
          const disabled = !active && value.length >= max;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              disabled={disabled}
              aria-pressed={active}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-teal bg-teal text-white"
                  : "border-border bg-card text-ink hover:bg-teal-tint",
                disabled ? "cursor-not-allowed opacity-40" : "",
              ].join(" ")}
            >
              {f.n}. {f.name.split(",")[0]}
            </button>
          );
        })}
      </div>
      <p className="hint mt-1.5">
        {value.length}/{max} {t.forms.areasHint}
      </p>
    </div>
  );
}
