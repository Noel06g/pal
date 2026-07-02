"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AreaPicker } from "@/components/AreaPicker";
import { ownerEditProfile, respondToLink, markTakeover, claimProfile } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

type LinkRow = {
  id: string;
  status: "AWAITING_EXPERT" | "APPROVED" | "REJECTED";
  takenOn: boolean;
  authorConfirmed: boolean;
  contactsShared: boolean;
  idea: { id: string; title: string };
};
type Profile = {
  id: string;
  name: string;
  areas: string[];
  bio: string;
  contact: string;
  status: "AWAITING_NOMINEE" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";
  cvFileName: string | null;
  ideaLinks: LinkRow[];
} | null;
type Claimable = { id: string; name: string; areas: string[] }[];

const statusLabel: Record<string, string> = {
  AWAITING_NOMINEE: "Në pritje",
  PENDING_REVIEW: "Në shqyrtim",
  PUBLISHED: "Publik",
  REJECTED: "Refuzuar",
};

export function AccountExpertPanel({ profile, claimable }: { profile: Profile; claimable: Claimable }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [areas, setAreas] = useState<string[]>(profile?.areas ?? []);

  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    if (busy) return;
    setBusy(key);
    try {
      const res = await fn();
      if (res.ok) {
        toast(okMsg, "success");
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

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (areas.length < 1) {
      toast("Zgjidh të paktën një fushë.", "error");
      return;
    }
    setBusy("edit");
    const fd = new FormData(e.currentTarget);
    fd.delete("areas");
    for (const a of areas) fd.append("areas", a);
    try {
      const res = await ownerEditProfile(fd);
      if (res.ok) {
        toast(t.toast.profileSaved, "success");
        setEditing(false);
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setBusy(null);
    }
  }

  if (!profile) {
    if (claimable.length === 0) return null;
    return (
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">{t.account.claimTitle}</h2>
        <ul className="space-y-3">
          {claimable.map((c) => (
            <li key={c.id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-semibold text-ink">{c.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {c.areas.map((a) => (
                    <span key={a} className="chip">
                      {fieldShort(a)}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => run(`claim-${c.id}`, () => claimProfile(c.id), t.toast.profileClaimed)}
                disabled={busy === `claim-${c.id}`}
                className="btn-primary text-sm disabled:opacity-60"
              >
                {t.account.claimBtn}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const pending = profile.ideaLinks.filter((l) => l.status === "AWAITING_EXPERT");
  const approved = profile.ideaLinks.filter((l) => l.status === "APPROVED");

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{t.account.expertProfile}</h2>
        <span className="badge-muted">{statusLabel[profile.status]}</span>
      </div>

      {/* Idea-links awaiting my approval */}
      {pending.length > 0 && (
        <div className="card mb-4 p-5">
          <h3 className="mb-3 text-base font-bold">{t.account.linksAwaitingYou}</h3>
          <ul className="space-y-3">
            {pending.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <Link href={`/idete/${l.idea.id}`} className="font-medium text-teal hover:underline">
                  {l.idea.title}
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => run(`ok-${l.id}`, () => respondToLink(l.id, "prano"), t.toast.linkAccepted)}
                    disabled={busy === `ok-${l.id}`}
                    className="btn-primary text-xs disabled:opacity-60"
                  >
                    {t.experts.confirmAccept}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(`no-${l.id}`, () => respondToLink(l.id, "refuzo"), t.toast.linkRejected)}
                    disabled={busy === `no-${l.id}`}
                    className="btn-danger-soft text-xs disabled:opacity-60"
                  >
                    {t.experts.confirmReject}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{t.account.linkConsentNote}</p>
        </div>
      )}

      {/* Approved links — take over */}
      {approved.length > 0 && (
        <div className="card mb-4 p-5">
          <h3 className="mb-3 text-base font-bold">{t.account.approvedLinks}</h3>
          <ul className="space-y-3">
            {approved.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <Link href={`/idete/${l.idea.id}`} className="font-medium text-teal hover:underline">
                  {l.idea.title}
                </Link>
                {l.authorConfirmed ? (
                  <span className="badge-muted">{t.idea.takenOver}</span>
                ) : l.takenOn ? (
                  <span className="text-xs text-muted">{t.account.awaitingAuthorConfirm}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => run(`take-${l.id}`, () => markTakeover(l.id), t.toast.takeoverMarked)}
                    disabled={busy === `take-${l.id}`}
                    className="btn-secondary text-xs disabled:opacity-60"
                  >
                    {t.account.takeOver}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit profile (goes live immediately) */}
      <div className="card p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold">{t.account.editProfile}</h3>
          <button type="button" onClick={() => setEditing((v) => !v)} className="btn-ghost text-sm">
            {editing ? t.common.cancel : t.common.edit}
          </button>
        </div>
        {editing ? (
          <form onSubmit={saveEdit} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="ep-name">
                {t.forms.expName}
              </label>
              <input id="ep-name" name="name" required defaultValue={profile.name} className="input" />
            </div>
            <div>
              <span className="label">{t.forms.expAreas}</span>
              <AreaPicker value={areas} onChange={setAreas} />
            </div>
            <div>
              <label className="label" htmlFor="ep-bio">
                {t.forms.expBio}
              </label>
              <textarea id="ep-bio" name="bio" required rows={3} defaultValue={profile.bio} className="input resize-y" />
            </div>
            <div>
              <label className="label" htmlFor="ep-contact">
                {t.forms.expContact}
              </label>
              <input id="ep-contact" name="contact" required defaultValue={profile.contact} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="ep-cv">
                {t.forms.expCvReplace}
              </label>
              <input id="ep-cv" name="cv" type="file" accept="application/pdf" className="input" />
              {profile.cvFileName && <p className="hint">CV: {profile.cvFileName}</p>}
            </div>
            <button type="submit" disabled={busy === "edit"} className="btn-primary disabled:opacity-60">
              {busy === "edit" ? t.common.loading : t.common.save}
            </button>
          </form>
        ) : (
          <div className="mt-3 text-sm text-muted">
            <div className="flex flex-wrap gap-1.5">
              {profile.areas.map((a) => (
                <span key={a} className="chip">
                  {fieldShort(a)}
                </span>
              ))}
            </div>
            <p className="mt-2">{profile.bio}</p>
          </div>
        )}
      </div>
    </section>
  );
}
