import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fieldName, fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

// Always render fresh: profiles get published/edited/removed by admin actions
// and must never be served from the static route cache.
export const dynamic = "force-dynamic";

async function getExpert(id: string) {
  return db.expertProfile.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      areas: true,
      bio: true,
      status: true,
      ideaLinks: {
        where: { status: "APPROVED" },
        select: { idea: { select: { id: true, title: true, fieldKey: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const expert = await getExpert(id);
  return { title: expert && expert.status === "PUBLISHED" ? expert.name : t.experts.title };
}

export default async function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expert = await getExpert(id);
  // Only PUBLISHED profiles are public. Contact/CV/status are never rendered here.
  if (!expert || expert.status !== "PUBLISHED") notFound();

  return (
    <div className="container-pal py-10">
      <Link href="/ekspertet" className="text-sm text-muted hover:text-teal">
        ← {t.experts.title}
      </Link>

      <div className="mt-4 max-w-3xl">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {expert.areas.map((a) => (
            <span key={a} className="chip">
              {fieldShort(a)}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">{expert.name}</h1>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Biografia</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink">{expert.bio}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Fushat</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {expert.areas.map((a) => (
              <li key={a} className="rounded-[10px] border border-border bg-card px-3 py-1.5 text-sm">
                {fieldName(a)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{t.experts.engagedIdeas}</h2>
          {expert.ideaLinks.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {expert.ideaLinks.map((l) => (
                <li key={l.idea.id}>
                  <Link
                    href={`/idete/${l.idea.id}`}
                    className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm hover:border-teal/40"
                  >
                    <span className="chip">{fieldShort(l.idea.fieldKey)}</span>
                    <span className="font-medium text-ink">{l.idea.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">{t.experts.noEngagedIdeas}</p>
          )}
        </section>

        <p className="mt-8 border-t border-border pt-4 text-xs text-muted">{t.experts.privateNote}</p>
      </div>
    </div>
  );
}
