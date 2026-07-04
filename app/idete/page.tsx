import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { IdeaCard, type IdeaCardData } from "@/components/IdeaCard";
import { IdeasSearch } from "@/components/IdeasSearch";
import { FieldFilter } from "@/components/FieldFilter";
import { FloatingBlobs } from "@/components/FloatingBlobs";
import { fieldName, isValidFieldKey } from "@/lib/fields";
import { fieldColor } from "@/lib/fieldColors";
import { t } from "@/lib/strings";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: t.ideas.listTitle };

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ fusha?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const activeField = sp.fusha && isValidFieldKey(sp.fusha) ? sp.fusha : null;
  const q = sp.q?.trim() ?? "";

  const where: Prisma.IdeaWhereInput = {};
  if (activeField) where.fieldKey = activeField;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { author: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const ideas = await db.idea.findMany({
    where,
    // Active first, then by support count desc — archived ideas sink below.
    orderBy: [
      { status: "asc" }, // ACTIVE < ARCHIVED alphabetically
      { supports: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    include: {
      author: { select: { name: true } },
      _count: { select: { supports: true, comments: true } },
    },
  });

  const cards: IdeaCardData[] = ideas.map((i) => ({
    id: i.id,
    title: i.title,
    summary: i.summary,
    fieldKey: i.fieldKey,
    authorName: i.author.name,
    supportCount: i._count.supports,
    commentCount: i._count.comments,
    archived: i.status === "ARCHIVED",
  }));

  const filterHref = (key: string | null) => {
    const params = new URLSearchParams();
    if (key) params.set("fusha", key);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/idete${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs
        opacity={0.08}
        blobs={[
          { color: "#B71C1C", top: "-10%", left: "85%", size: 300, anim: "animate-blob-a" },
          { color: "#E8A33D", top: "70%", left: "-5%", size: 260, anim: "animate-blob-b" },
        ]}
      />
      <div className="container-pal relative py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.ideas.listTitle}
          </h1>
          <p className="mt-1 text-muted">{t.ideas.listSub}</p>
        </div>
        <Link href="/idete/krijo" className="btn-primary">
          {t.nav.newIdea}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filter (collapses into a button on mobile) */}
        <aside>
          <FieldFilter activeField={activeField} q={q} />
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4">
            <IdeasSearch />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{t.ideas.sortNote}</span>
              {activeField && (
                <span
                  className="chip"
                  style={{
                    borderColor: fieldColor(activeField).border,
                    color: fieldColor(activeField).fg,
                    backgroundColor: fieldColor(activeField).bg,
                  }}
                >
                  {fieldName(activeField)}
                  <Link
                    href={filterHref(null)}
                    aria-label="Hiq filtrin"
                    className="ml-1 font-bold"
                  >
                    ×
                  </Link>
                </span>
              )}
            </div>
          </div>

          {cards.length > 0 ? (
            <div className="stagger-in grid gap-4 sm:grid-cols-2">
              {cards.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-tint text-ink animate-icon-pulse"
                aria-hidden
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.3 1 2.1h5c0-.8.3-1.6 1-2.1A6 6 0 0 0 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 19h4M10.5 21.5h3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="max-w-sm text-muted">{t.ideas.empty}</p>
              <Link href="/idete/krijo" className="btn-primary mt-1">
                {t.nav.newIdea}
              </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
