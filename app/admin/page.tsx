import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.admin.title, robots: { index: false } };

function fmt(d: Date) {
  return new Intl.DateTimeFormat("sq-AL", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export default async function AdminPage() {
  // Server-side role enforcement. Never rely on hidden UI.
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const [reports, ideas, users, experts] = await Promise.all([
    db.report.findMany({ orderBy: [{ resolved: "asc" }, { createdAt: "desc" }] }),
    db.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        _count: { select: { supports: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { ideas: true } } },
    }),
    db.expertProfile.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="container-pal py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{t.admin.title}</h1>
      <AdminPanel
        reports={reports.map((r) => ({
          id: r.id,
          ideaTitle: r.ideaTitle,
          reason: r.reason,
          reporterEmail: r.reporterEmail,
          resolved: r.resolved,
          ideaId: r.ideaId,
          commentId: r.commentId,
          createdAt: fmt(r.createdAt),
        }))}
        ideas={ideas.map((i) => ({
          id: i.id,
          title: i.title,
          fieldKey: i.fieldKey,
          authorName: i.author.name,
          status: i.status,
          supportCount: i._count.supports,
        }))}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          isAdmin: u.isAdmin,
          isBanned: u.isBanned,
          ideaCount: u._count.ideas,
        }))}
        experts={experts.map((e) => ({
          id: e.id,
          name: e.name,
          fieldKey: e.fieldKey,
          bio: e.bio,
          status: e.status,
          source: e.source,
          awaitingConsent: Boolean(e.confirmToken),
          contact: e.contact,
          reason: e.reason,
          cvFileName: e.cvFileName,
          proposerName: e.proposerName,
          proposerContact: e.proposerContact,
          fromIdeaId: e.fromIdeaId,
        }))}
      />
    </div>
  );
}
