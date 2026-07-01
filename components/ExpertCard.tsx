import Link from "next/link";
import { fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

export type ExpertCardData = {
  id: string;
  name: string;
  areas: string[];
  bio: string;
};

/** Public expert card — clickable to the profile. ONLY name, areas and bio are ever public. */
export function ExpertCard({ expert }: { expert: ExpertCardData }) {
  return (
    <Link
      href={`/ekspertet/${expert.id}`}
      className="card flex h-full flex-col p-5 transition hover:border-teal/40 hover:shadow-md"
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {expert.areas.map((a) => (
          <span key={a} className="chip">
            {fieldShort(a)}
          </span>
        ))}
      </div>
      <h3 className="text-lg font-bold text-ink">{expert.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{expert.bio}</p>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted">{t.experts.privateNote}</p>
    </Link>
  );
}
