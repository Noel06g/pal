import Link from "next/link";
import { fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

export type IdeaCardData = {
  id: string;
  title: string;
  summary: string;
  fieldKey: string;
  authorName: string;
  supportCount: number;
  commentCount: number;
  archived: boolean;
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

export function IdeaCard({ idea }: { idea: IdeaCardData }) {
  return (
    <Link href={`/idete/${idea.id}`} className="card card-lift flex h-full flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="chip">{fieldShort(idea.fieldKey)}</span>
        {idea.archived ? (
          <span className="badge-muted">{t.ideas.statusArchived}</span>
        ) : (
          <span className="badge-ok">{t.ideas.statusActive}</span>
        )}
      </div>
      <h3 className="text-lg font-bold leading-snug text-ink">{idea.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {truncate(idea.summary, 160)}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
        <span>
          {t.ideas.by} <span className="font-medium text-ink">{idea.authorName}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold text-teal-dk">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M7 12s-5-3.2-5-6.5A2.5 2.5 0 0 1 7 4a2.5 2.5 0 0 1 5 1.5C12 8.8 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            {idea.supportCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 3.5h10v6H6l-2.5 2v-2H2v-6Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            {idea.commentCount}
          </span>
        </span>
      </div>
    </Link>
  );
}
