"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { fieldName, fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";
import {
  adminResolveReport,
  adminDeleteReportedIdea,
  adminDeleteReportedComment,
  adminDeleteIdea,
  adminSetBan,
  adminDeleteUser,
  adminApproveExpert,
  adminRejectExpert,
  adminDeleteExpert,
  adminApproveEdit,
  adminRejectEdit,
  adminMergeExperts,
} from "@/app/actions/admin";

type Report = {
  id: string;
  ideaTitle: string;
  reason: string;
  reporterEmail: string;
  resolved: boolean;
  ideaId: string | null;
  commentId: string | null;
  createdAt: string;
};
type IdeaRow = {
  id: string;
  title: string;
  fieldKey: string;
  authorName: string;
  status: "ACTIVE" | "ARCHIVED";
  supportCount: number;
};
type UserRow = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  ideaCount: number;
};
type ExpertRow = {
  id: string;
  name: string;
  areas: string[];
  bio: string;
  status: "AWAITING_NOMINEE" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  source: "SELF" | "NOMINATED";
  hasAccount: boolean;
  contact: string;
  reason: string;
  cvFileName: string | null;
  proposerName: string | null;
  proposerContact: string | null;
};
type EditRow = { id: string; expertName: string; summary: string };

type Tab = "reports" | "ideas" | "accounts" | "experts" | "edits" | "merge";

const statusBadge: Record<ExpertRow["status"], { label: string; cls: string }> = {
  AWAITING_NOMINEE: { label: "Pret pëlqimin", cls: "badge-amber" },
  PENDING_REVIEW: { label: "Në shqyrtim", cls: "badge-amber" },
  PUBLISHED: { label: "Publik", cls: "badge-ok" },
  REJECTED: { label: "Refuzuar", cls: "badge-muted" },
};

export function AdminPanel({
  reports,
  ideas,
  users,
  experts,
  edits,
}: {
  reports: Report[];
  ideas: IdeaRow[];
  users: UserRow[];
  experts: ExpertRow[];
  edits: EditRow[];
}) {
  const [tab, setTab] = useState<Tab>("reports");
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>, confirmMsg?: string) {
    if (busy) return;
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(key);
    try {
      const res = await fn();
      if (res.ok) {
        toast(t.common.success, "success");
        router.refresh();
      } else {
        toast(res.error ?? t.common.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setBusy(null);
    }
  }

  const pendingExperts = experts.filter((e) => e.status === "AWAITING_NOMINEE" || e.status === "PENDING_REVIEW");
  const otherExperts = experts.filter((e) => e.status === "PUBLISHED" || e.status === "REJECTED");
  const openReports = reports.filter((r) => !r.resolved).length;

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "reports", label: t.admin.tabReports, badge: openReports },
    { key: "ideas", label: t.admin.tabIdeas },
    { key: "accounts", label: t.admin.tabAccounts },
    { key: "experts", label: t.admin.tabExperts, badge: pendingExperts.length },
    { key: "edits", label: t.admin.tabEdits, badge: edits.length },
    { key: "merge", label: t.admin.tabMerge },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={[
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold",
              tab === tb.key ? "border-teal text-teal-dk" : "border-transparent text-muted hover:text-ink",
            ].join(" ")}
          >
            {tb.label}
            {tb.badge ? (
              <span className="ml-2 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">{tb.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* REPORTS */}
      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 && <p className="text-sm text-muted">S&apos;ka raportime.</p>}
          {reports.map((r) => (
            <div key={r.id} className={`card p-4 ${r.resolved ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {r.ideaId ? (
                      <a
                        href={`/idete/${r.ideaId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-teal hover:underline"
                      >
                        {r.ideaTitle}
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{r.ideaTitle}</span>
                    )}
                    {r.resolved && <span className="badge-muted">{t.admin.resolved}</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{r.reason}</p>
                  <p className="mt-2 text-xs text-muted">
                    {t.admin.reportReporter}: <span className="font-medium">{r.reporterEmail}</span> · {r.createdAt}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {r.ideaId && (
                    <button
                      onClick={() => run(`rep-del-${r.id}`, () => adminDeleteReportedIdea(r.id), "Fshi idenë e raportuar?")}
                      disabled={busy === `rep-del-${r.id}`}
                      className="btn-danger-soft text-xs"
                    >
                      {t.admin.reportDelete}
                    </button>
                  )}
                  {r.commentId && (
                    <button
                      onClick={() =>
                        run(`rep-delc-${r.id}`, () => adminDeleteReportedComment(r.id), "Fshi komentin e raportuar?")
                      }
                      disabled={busy === `rep-delc-${r.id}`}
                      className="btn-danger-soft text-xs"
                    >
                      {t.admin.reportDeleteComment}
                    </button>
                  )}
                  {!r.resolved && (
                    <button
                      onClick={() => run(`rep-res-${r.id}`, () => adminResolveReport(r.id))}
                      disabled={busy === `rep-res-${r.id}`}
                      className="btn-secondary text-xs"
                    >
                      {t.admin.reportResolve}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IDEAS */}
      {tab === "ideas" && (
        <Table head={["Titulli", "Fusha", "Autori", "Statusi", "Mbështetje", ""]}>
          {ideas.map((i) => (
            <tr key={i.id} className="border-t border-border">
              <td className="px-3 py-2.5">
                <a href={`/idete/${i.id}`} className="font-medium text-teal hover:underline">
                  {i.title}
                </a>
              </td>
              <td className="px-3 py-2.5 text-sm text-muted">{fieldShort(i.fieldKey)}</td>
              <td className="px-3 py-2.5 text-sm">{i.authorName}</td>
              <td className="px-3 py-2.5 text-sm">
                {i.status === "ARCHIVED" ? (
                  <span className="badge-muted">{t.ideas.statusArchived}</span>
                ) : (
                  <span className="badge-ok">{t.ideas.statusActive}</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-sm">{i.supportCount}</td>
              <td className="px-3 py-2.5 text-right">
                <button
                  onClick={() => run(`idea-del-${i.id}`, () => adminDeleteIdea(i.id), "Fshi këtë ide?")}
                  disabled={busy === `idea-del-${i.id}`}
                  className="btn-danger-soft text-xs"
                >
                  {t.admin.delete}
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* ACCOUNTS */}
      {tab === "accounts" && (
        <Table head={["Emri", "Email", "Roli", "Ide", ""]}>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="px-3 py-2.5 font-medium">{u.name}</td>
              <td className="px-3 py-2.5 text-sm text-muted">{u.email}</td>
              <td className="px-3 py-2.5 text-sm">
                {u.isAdmin && <span className="badge-ok mr-1">Admin</span>}
                {u.isBanned && <span className="badge-amber">Pezulluar</span>}
              </td>
              <td className="px-3 py-2.5 text-sm">{u.ideaCount}</td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => run(`ban-${u.id}`, () => adminSetBan(u.id, !u.isBanned))}
                    disabled={busy === `ban-${u.id}`}
                    className="btn-secondary text-xs"
                  >
                    {u.isBanned ? t.admin.unban : t.admin.ban}
                  </button>
                  <button
                    onClick={() => run(`udel-${u.id}`, () => adminDeleteUser(u.id), "Fshi këtë llogari përfundimisht?")}
                    disabled={busy === `udel-${u.id}`}
                    className="btn-danger-soft text-xs"
                  >
                    {t.admin.delete}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* EXPERTS */}
      {tab === "experts" && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
              {t.admin.pending} ({pendingExperts.length})
            </h3>
            {pendingExperts.length === 0 && <p className="text-sm text-muted">{t.admin.noPrivate}</p>}
            <div className="space-y-3">
              {pendingExperts.map((e) => (
                <ExpertAdminCard key={e.id} e={e} busy={busy} run={run} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{t.admin.confirmed} & të tjerë</h3>
            <div className="space-y-3">
              {otherExperts.map((e) => (
                <ExpertAdminCard key={e.id} e={e} busy={busy} run={run} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* EDIT QUEUE */}
      {tab === "edits" && (
        <div className="space-y-3">
          {edits.length === 0 && <p className="text-sm text-muted">{t.admin.noPrivate}</p>}
          {edits.map((ed) => (
            <div key={ed.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{ed.expertName}</div>
                  <p className="mt-1 text-sm text-muted">{ed.summary}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => run(`ed-ok-${ed.id}`, () => adminApproveEdit(ed.id))}
                    disabled={busy === `ed-ok-${ed.id}`}
                    className="btn-primary text-xs"
                  >
                    {t.admin.approve}
                  </button>
                  <button
                    onClick={() => run(`ed-no-${ed.id}`, () => adminRejectEdit(ed.id))}
                    disabled={busy === `ed-no-${ed.id}`}
                    className="btn-secondary text-xs"
                  >
                    {t.admin.reject}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MERGE DUPLICATES */}
      {tab === "merge" && <MergeTool experts={experts} busy={busy} run={run} />}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ExpertAdminCard({
  e,
  busy,
  run,
}: {
  e: ExpertRow;
  busy: string | null;
  run: (k: string, fn: () => Promise<{ ok: boolean; error?: string }>, c?: string) => void;
}) {
  const sb = statusBadge[e.status];
  // A nominated person must consent first — "Mirato" appears only after that.
  const canApprove = e.status === "PENDING_REVIEW";
  const canReview = e.status === "AWAITING_NOMINEE" || e.status === "PENDING_REVIEW";
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{e.name}</span>
            {e.areas.map((a) => (
              <span key={a} className="chip">
                {fieldShort(a)}
              </span>
            ))}
            <span className="badge-muted">{e.source === "SELF" ? "Vetëpropozim" : "Propozim"}</span>
            {e.hasAccount && <span className="badge-muted">Llogari</span>}
            <span className={sb.cls}>{sb.label}</span>
          </div>
          <p className="mt-2 text-sm text-muted">{e.bio}</p>

          {/* PRIVATE — admin only */}
          <dl className="mt-3 grid gap-1 rounded-[10px] bg-paper p-3 text-xs">
            <Row k={t.admin.contact} v={e.contact} />
            <Row k={t.admin.reason} v={e.reason} />
            {e.proposerName && <Row k={t.admin.proposer} v={`${e.proposerName} · ${e.proposerContact ?? ""}`} />}
            <Row k="Fushat" v={e.areas.map((a) => fieldName(a)).join(", ")} />
            {e.cvFileName && (
              <div className="flex gap-2">
                <dt className="font-semibold text-ink">CV:</dt>
                <dd>
                  <a href={`/api/experts/${e.id}/cv`} className="link-underline">
                    {t.admin.downloadCv} ({e.cvFileName})
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {canApprove && (
            <button
              onClick={() => run(`exp-ok-${e.id}`, () => adminApproveExpert(e.id))}
              disabled={busy === `exp-ok-${e.id}`}
              className="btn-primary text-xs"
            >
              {t.admin.approve}
            </button>
          )}
          {canReview && (
            <button
              onClick={() => run(`exp-no-${e.id}`, () => adminRejectExpert(e.id))}
              disabled={busy === `exp-no-${e.id}`}
              className="btn-secondary text-xs"
            >
              {t.admin.reject}
            </button>
          )}
          <button
            onClick={() => run(`exp-del-${e.id}`, () => adminDeleteExpert(e.id), "Fshi këtë ekspert?")}
            disabled={busy === `exp-del-${e.id}`}
            className="btn-danger-soft text-xs"
          >
            {t.admin.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function MergeTool({
  experts,
  busy,
  run,
}: {
  experts: ExpertRow[];
  busy: string | null;
  run: (k: string, fn: () => Promise<{ ok: boolean; error?: string }>, c?: string) => void;
}) {
  const [keepId, setKeepId] = useState("");
  const [dropId, setDropId] = useState("");
  const options = experts.map((e) => ({ id: e.id, label: `${e.name} — ${e.areas.map(fieldShort).join(", ")}` }));

  return (
    <div className="card max-w-xl p-6">
      <h3 className="text-base font-bold">{t.admin.mergeTitle}</h3>
      <p className="mt-1 text-sm text-muted">{t.admin.mergeNote}</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="merge-keep">
            {t.admin.mergeKeep}
          </label>
          <select id="merge-keep" value={keepId} onChange={(e) => setKeepId(e.target.value)} className="input">
            <option value="">—</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="merge-drop">
            {t.admin.mergeDrop}
          </label>
          <select id="merge-drop" value={dropId} onChange={(e) => setDropId(e.target.value)} className="input">
            <option value="">—</option>
            {options
              .filter((o) => o.id !== keepId)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
          </select>
        </div>
        <button
          type="button"
          disabled={!keepId || !dropId || busy === "merge"}
          onClick={() => run("merge", () => adminMergeExperts(keepId, dropId), t.admin.mergeConfirm)}
          className="btn-primary disabled:opacity-60"
        >
          {t.admin.mergeBtn}
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-semibold text-ink">{k}:</dt>
      <dd className="text-muted">{v}</dd>
    </div>
  );
}
