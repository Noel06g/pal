import Link from "next/link";
import { FIELDS } from "@/lib/fields";

/**
 * The signature numbered 14-field index grid. Each cell links to the ideas list
 * filtered by that field.
 */
export function FieldIndex() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FIELDS.map((f) => (
        <li key={f.key}>
          <Link
            href={`/idete?fusha=${f.key}`}
            className="group flex h-full items-start gap-3 rounded-[14px] border border-border bg-card p-4 transition-colors hover:border-teal hover:bg-teal-tint/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-tint font-display text-base font-extrabold text-teal-dk group-hover:bg-teal group-hover:text-white">
              {f.n}
            </span>
            <span className="pt-0.5">
              <span className="block font-semibold leading-snug text-ink">{f.name}</span>
              <span className="mt-1 block text-xs text-muted">
                {f.subs.slice(0, 3).join(" · ")}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
