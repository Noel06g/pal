import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { IdeaCard, type IdeaCardData } from "@/components/IdeaCard";
import { IdeasSearch } from "@/components/IdeasSearch";
import { FIELDS, fieldName, isValidFieldKey } from "@/lib/fields";
import { OTHER_FIELD } from "@/lib/fields";
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
    <div className="container-pal py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.ideas.listTitle}</h1>
          <p className="mt-1 text-muted">{t.ideas.listSub}</p>
        </div>
        <Link href="/idete/krijo" className="btn-primary">
          {t.nav.newIdea}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filter */}
        <aside>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            {t.ideas.filterTitle}
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href={filterHref(null)}
                className={[
                  "block rounded-md px-3 py-2 text-sm",
                  !activeField ? "bg-teal-tint font-semibold text-teal-dk" : "text-ink hover:bg-teal-tint",
                ].join(" ")}
              >
                {t.ideas.filterAll}
              </Link>
            </li>
            {FIELDS.map((f) => (
              <li key={f.key}>
                <Link
                  href={filterHref(f.key)}
                  className={[
                    "block rounded-md px-3 py-2 text-sm leading-snug",
                    activeField === f.key
                      ? "bg-teal-tint font-semibold text-teal-dk"
                      : "text-ink hover:bg-teal-tint",
                  ].join(" ")}
                >
                  {f.n}. {f.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={filterHref(OTHER_FIELD.key)}
                className={[
                  "block rounded-md px-3 py-2 text-sm",
                  activeField === OTHER_FIELD.key
                    ? "bg-teal-tint font-semibold text-teal-dk"
                    : "text-ink hover:bg-teal-tint",
                ].join(" ")}
              >
                {OTHER_FIELD.name}
              </Link>
            </li>
          </ul>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4">
            <IdeasSearch />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{t.ideas.sortNote}</span>
              {activeField && (
                <span className="chip">
                  {fieldName(activeField)}
                  <Link href={filterHref(null)} aria-label="Hiq filtrin" className="ml-1 font-bold">
                    ×
                  </Link>
                </span>
              )}
            </div>
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center text-muted">{t.ideas.empty}</div>
          )}
        </div>
      </div>
    </div>
  );
}
