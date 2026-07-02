import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";
import { SupportButton } from "@/components/SupportButton";
import { ArchiveButton } from "@/components/ArchiveButton";
import { ReportButton } from "@/components/ReportButton";
import { ProposeExpertButton } from "@/components/ProposeExpertButton";
import { ConfirmTakeoverButton } from "@/components/ConfirmTakeoverButton";
import { CommentList, type CommentData } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";
import { fieldName } from "@/lib/fields";
import { t } from "@/lib/strings";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium" }).format(d);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const idea = await db.idea.findUnique({
    where: { id },
    select: { title: true, summary: true },
  });
  if (!idea) return { title: t.common.notFoundTitle };
  return { title: idea.title, description: idea.summary.slice(0, 160) };
}

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // getActiveUser: banned users see the logged-out (read-only) UI — the same
  // rule every server action enforces.
  const user = await getActiveUser();

  const idea = await db.idea.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      documents: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      _count: { select: { supports: true } },
    },
  });
  if (!idea) notFound();

  const [supported, fieldExperts, expertLinks] = await Promise.all([
    user
      ? db.support.findUnique({
          where: { ideaId_userId: { ideaId: idea.id, userId: user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.expertProfile.findMany({
      where: { status: "PUBLISHED", areas: { has: idea.fieldKey } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, bio: true, areas: true },
    }),
    db.ideaExpert.findMany({
      where: { ideaId: idea.id },
      orderBy: { createdAt: "desc" },
      include: {
        expert: {
          select: { id: true, name: true, status: true, contact: true },
        },
      },
    }),
  ]);

  const isArchived = idea.status === "ARCHIVED";
  const isOwner = user?.id === idea.author.id;
  const canModerate = isOwner || Boolean(user?.isAdmin);

  // Publicly, only APPROVED links to PUBLISHED experts are shown.
  const publicLinks = expertLinks.filter(
    (l) => l.status === "APPROVED" && l.expert.status === "PUBLISHED",
  );
  // The author additionally sees pending replies and the private contact reveal.
  const authorPending = isOwner
    ? expertLinks.filter((l) => l.status === "AWAITING_EXPERT")
    : [];
  const authorApproved = isOwner
    ? expertLinks.filter((l) => l.status === "APPROVED")
    : [];
  const showExpertsCard =
    publicLinks.length > 0 ||
    authorPending.length > 0 ||
    authorApproved.length > 0;

  const comments: CommentData[] = idea.comments.map((c) => ({
    id: c.id,
    body: c.body,
    stance: c.stance,
    isSolution: c.isSolution,
    authorName: c.author.name,
    createdAt: fmtDate(c.createdAt),
    // Own comment, own idea, or admin — mirrors deleteComment's server rule.
    canDelete: Boolean(user && (c.authorId === user.id || canModerate)),
  }));

  return (
    <div className="container-pal py-10">
      <Link href="/idete" className="text-sm text-muted hover:text-teal">
        {t.idea.backToList}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <article>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="chip">{fieldName(idea.fieldKey)}</span>
            {isArchived ? (
              <span className="badge-muted">{t.ideas.statusArchived}</span>
            ) : (
              <span className="badge-ok">{t.ideas.statusActive}</span>
            )}
            {idea.subfield && (
              <span className="badge-muted">{idea.subfield}</span>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            {idea.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t.ideas.by}{" "}
            <span className="font-semibold text-ink">{idea.author.name}</span> ·{" "}
            {fmtDate(idea.createdAt)}
          </p>

          {idea.fieldKey === "other" && idea.otherText && (
            <p className="mt-3 rounded-[10px] bg-paper p-3 text-sm text-muted">
              <span className="font-semibold text-ink">Fusha (Tjetër):</span>{" "}
              {idea.otherText}
            </p>
          )}

          <div className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-ink">
            {idea.summary}
          </div>

          {isArchived && (
            <p className="mt-6 rounded-[10px] border border-border bg-paper p-3 text-sm text-muted">
              {t.ideas.archivedNote}
            </p>
          )}

          {/* Documents */}
          {idea.documents.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold">{t.idea.documents}</h2>
              <ul className="space-y-2">
                {idea.documents.map((d) => (
                  <li key={d.id}>
                    <a
                      href={`/api/files/${d.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2 text-sm hover:bg-teal-tint"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M4 1.5h5L13 5v9.5H4V1.5Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 1.5V5h4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-medium text-teal-dk">
                        {d.fileName}
                      </span>
                      <span className="text-xs text-muted">
                        ({Math.round(d.size / 1024)} KB)
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Comments */}
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">
              {t.idea.commentsTitle} ({comments.length})
            </h2>
            {!isArchived && (
              <div className="mb-6">
                <CommentForm ideaId={idea.id} loggedIn={Boolean(user)} />
              </div>
            )}
            <CommentList comments={comments} loggedIn={Boolean(user)} />
          </section>
        </article>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="card space-y-3 p-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal">
                {idea._count.supports}
              </div>
              <div className="text-xs text-muted">{t.ideas.supports}</div>
            </div>
            <SupportButton
              ideaId={idea.id}
              initialSupported={Boolean(supported)}
              initialCount={idea._count.supports}
              loggedIn={Boolean(user)}
              disabled={isArchived}
            />
            {!isArchived && (
              <ProposeExpertButton
                ideaId={idea.id}
                fieldKey={idea.fieldKey}
                loggedIn={Boolean(user)}
              />
            )}
            <ReportButton
              ideaId={idea.id}
              loggedIn={Boolean(user)}
              variant="button"
            />
            {isOwner && !isArchived && <ArchiveButton ideaId={idea.id} />}
          </div>

          {/* Ekspertët e propozuar për këtë ide */}
          {showExpertsCard && (
            <div className="card p-5">
              <h2 className="mb-3 text-base font-bold">
                {t.idea.linkedExperts}
              </h2>
              <ul className="space-y-3">
                {isOwner ? (
                  <>
                    {authorApproved.map((l) => (
                      <li
                        key={l.id}
                        className="border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {l.expert.status === "PUBLISHED" ? (
                            <Link
                              href={`/ekspertet/${l.expert.id}`}
                              className="font-semibold text-ink hover:text-teal"
                            >
                              {l.expert.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-ink">
                              {l.expert.name}
                            </span>
                          )}
                          <span className="badge-ok">
                            {t.idea.linkApproved}
                          </span>
                        </div>
                        {l.contactsSharedAt && (
                          <p className="mt-1 text-xs text-muted">
                            {t.idea.contactLabel}:{" "}
                            <span className="font-medium text-ink">
                              {l.expert.contact}
                            </span>
                          </p>
                        )}
                        {l.takenOn && !l.authorConfirmed && (
                          <div className="mt-2">
                            <ConfirmTakeoverButton linkId={l.id} />
                          </div>
                        )}
                        {l.authorConfirmed && (
                          <p className="mt-1 text-xs font-medium text-teal-dk">
                            {t.idea.takenOver}
                          </p>
                        )}
                      </li>
                    ))}
                    {authorPending.map((l) => (
                      <li
                        key={l.id}
                        className="border-b border-border pb-3 text-sm text-muted last:border-0 last:pb-0"
                      >
                        {/* Unpublished nominees stay anonymous until they consent. */}
                        {t.idea.awaitingResponse}{" "}
                        <span className="font-semibold text-ink">
                          {l.expert.status === "PUBLISHED"
                            ? l.expert.name
                            : t.idea.pendingExpert}
                        </span>
                      </li>
                    ))}
                  </>
                ) : (
                  publicLinks.map((l) => (
                    <li
                      key={l.id}
                      className="border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <Link
                        href={`/ekspertet/${l.expert.id}`}
                        className="font-semibold text-ink hover:text-teal"
                      >
                        {l.expert.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* Ekspertë në këtë fushë */}
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold">
              {t.idea.expertsInField}
            </h2>
            {fieldExperts.length > 0 ? (
              <ul className="space-y-3">
                {fieldExperts.map((e) => (
                  <li
                    key={e.id}
                    className="border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <Link
                      href={`/ekspertet/${e.id}`}
                      className="font-semibold text-ink hover:text-teal"
                    >
                      {e.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-3 text-xs text-muted">
                      {e.bio}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.idea.noExpertsInField}</p>
            )}
            <Link
              href={`/ekspertet?fusha=${idea.fieldKey}`}
              className="mt-3 inline-block text-sm font-semibold text-teal hover:underline"
            >
              {t.home.viewAll} →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
