import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { AccountExpertPanel } from "@/components/AccountExpertPanel";
import { fieldShort } from "@/lib/fields";
import { normalizeEmail } from "@/lib/normalize";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.account.title };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/hyr?next=/llogaria");

  const [ideas, profile] = await Promise.all([
    db.idea.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { supports: true, comments: true } } },
    }),
    db.expertProfile.findUnique({
      where: { ownerUserId: user.id },
      select: {
        id: true,
        name: true,
        areas: true,
        bio: true,
        contact: true,
        status: true,
        cvFileName: true,
        ideaLinks: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            takenOn: true,
            authorConfirmed: true,
            contactsSharedAt: true,
            idea: { select: { id: true, title: true } },
          },
        },
      },
    }),
  ]);

  const normalized = normalizeEmail(user.email ?? "");
  const claimable =
    profile || !normalized
      ? []
      : await db.expertProfile.findMany({
          where: { ownerUserId: null, contactEmail: normalized, status: { not: "REJECTED" } },
          select: { id: true, name: true, areas: true },
        });

  const profileForPanel = profile
    ? {
        ...profile,
        ideaLinks: profile.ideaLinks.map((l) => ({
          id: l.id,
          status: l.status,
          takenOn: l.takenOn,
          authorConfirmed: l.authorConfirmed,
          contactsShared: Boolean(l.contactsSharedAt),
          idea: l.idea,
        })),
      }
    : null;

  return (
    <div className="container-pal py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.account.title}</h1>
      <div className="mt-2 text-muted">
        <span className="font-semibold text-ink">{user.name}</span> · {user.email}
        {user.isAdmin && <span className="badge-ok ml-2">Admin</span>}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">{t.account.yourIdeas}</h2>
        {ideas.length > 0 ? (
          <ul className="space-y-3">
            {ideas.map((i) => (
              <li key={i.id} className="card flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link href={`/idete/${i.id}`} className="font-semibold text-teal hover:underline">
                    {i.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="chip">{fieldShort(i.fieldKey)}</span>
                    {i.status === "ARCHIVED" ? (
                      <span className="badge-muted">{t.ideas.statusArchived}</span>
                    ) : (
                      <span className="badge-ok">{t.ideas.statusActive}</span>
                    )}
                    <span>
                      {i._count.supports} {t.ideas.supports} · {i._count.comments} {t.ideas.comments}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t.account.noIdeas}</p>
        )}
      </section>

      <AccountExpertPanel profile={profileForPanel} claimable={claimable} />

      <section className="mt-12">
        <div className="card border-danger/30 p-6">
          <h2 className="text-lg font-bold text-danger">{t.account.deleteTitle}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{t.account.deleteWarn}</p>
          <div className="mt-4">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  );
}
