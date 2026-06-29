import { fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

export type ExpertCardData = {
  id: string;
  name: string;
  fieldKey: string;
  bio: string;
};

/** Public expert card. ONLY name, field and bio are ever shown publicly. */
export function ExpertCard({ expert }: { expert: ExpertCardData }) {
  return (
    <article className="card flex h-full flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="chip">
          {t.experts.badgePrefix} {fieldShort(expert.fieldKey)}
        </span>
      </div>
      <h3 className="text-lg font-bold text-ink">{expert.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{expert.bio}</p>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
        {t.experts.privateNote}
      </p>
    </article>
  );
}
