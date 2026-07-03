import Link from "next/link";
import { FieldChip } from "@/components/FieldChip";
import { fieldColor } from "@/lib/fieldColors";
import { t } from "@/lib/strings";

export type ExpertCardData = {
  id: string;
  name: string;
  areas: string[];
  bio: string;
};

/** Public expert card — clickable to the profile. ONLY name, areas and bio are ever public. */
export function ExpertCard({ expert }: { expert: ExpertCardData }) {
  const color = fieldColor(expert.areas[0] ?? "");
  return (
    <Link
      href={`/ekspertet/${expert.id}`}
      className="card card-lift tint flex h-full flex-col border-l-4 p-5"
      style={
        {
          borderLeftColor: color.fg,
          "--tint-bg": color.bg,
          "--tint-bg-hover": color.bgHover,
        } as React.CSSProperties
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {expert.areas.map((a) => (
          <FieldChip key={a} fieldKey={a} />
        ))}
      </div>
      <h3 className="text-lg font-bold text-ink">{expert.name}</h3>
      <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-muted">
        {expert.bio}
      </p>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
        {t.experts.privateNote}
      </p>
    </Link>
  );
}
