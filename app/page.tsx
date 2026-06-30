import Link from "next/link";
import { db } from "@/lib/db";
import { Hero } from "@/components/Hero";
import { FieldIndex } from "@/components/FieldIndex";
import { IdeaCard, type IdeaCardData } from "@/components/IdeaCard";
import { ExpertCard } from "@/components/ExpertCard";
import { t } from "@/lib/strings";

export default async function HomePage() {
  const [topIdeas, experts] = await Promise.all([
    db.idea.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ supports: { _count: "desc" } }, { createdAt: "desc" }],
      take: 6,
      include: {
        author: { select: { name: true } },
        _count: { select: { supports: true, comments: true } },
      },
    }),
    db.expertProfile.findMany({
      where: { status: "CONFIRMED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, fieldKey: true, bio: true },
    }),
  ]);

  const ideaCards: IdeaCardData[] = topIdeas.map((i) => ({
    id: i.id,
    title: i.title,
    summary: i.summary,
    fieldKey: i.fieldKey,
    authorName: i.author.name,
    supportCount: i._count.supports,
    commentCount: i._count.comments,
    archived: i.status === "ARCHIVED",
  }));

  return (
    <>
      <Hero />

      {/* Pse Platforma Shqiptare? */}
      <section className="border-b border-border bg-card/60">
        <div className="container-pal py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.whyTitle}</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted">
              {t.home.why.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Propozo idenë dhe zgjidhjen tënde */}
      <section className="container-pal py-14">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.howTitle}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {t.home.how.map((step, i) => (
            <li key={i} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal text-lg font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ekspertët teaser — mbi 14 fushat */}
      <section className="container-pal py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.expertsTeaser}</h2>
            <p className="mt-2 text-muted">{t.home.expertsTeaserSub}</p>
          </div>
          <Link href="/ekspertet" className="link-underline shrink-0 text-sm font-semibold">
            {t.home.viewAll} →
          </Link>
        </div>
        {experts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t.experts.empty}</p>
        )}
      </section>

      {/* 14 fushat */}
      <section className="border-y border-border bg-card/60">
        <div className="container-pal py-14">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.fieldsTitle}</h2>
            <p className="mt-2 text-muted">{t.home.fieldsSub}</p>
          </div>
          <FieldIndex />
        </div>
      </section>

      {/* Idetë më të mbështetura */}
      <section className="container-pal py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.mostSupported}</h2>
          <Link href="/idete" className="link-underline shrink-0 text-sm font-semibold">
            {t.home.viewAll} →
          </Link>
        </div>
        {ideaCards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideaCards.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t.ideas.empty}</p>
        )}
      </section>

      {/* Rreth teaser */}
      <section className="container-pal py-14">
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight">{t.home.aboutTeaser}</h2>
            <p className="mt-2 text-muted">{t.home.aboutTeaserSub}</p>
          </div>
          <Link href="/rreth" className="btn-secondary shrink-0">
            {t.nav.about}
          </Link>
        </div>
      </section>
    </>
  );
}
