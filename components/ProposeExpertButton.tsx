"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { AreaPicker } from "@/components/AreaPicker";
import { searchExperts, proposeExistingExpert, proposeNewExpert } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { fieldShort } from "@/lib/fields";
import { t } from "@/lib/strings";

type Result = { id: string; name: string; areas: string[]; bio: string };

export function ProposeExpertButton({
  ideaId,
  fieldKey,
  loggedIn,
}: {
  ideaId: string;
  fieldKey: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"search" | "new">("search");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState(false);
  const [areas, setAreas] = useState<string[]>(fieldKey && fieldKey !== "other" ? [fieldKey] : []);

  if (!loggedIn) {
    return (
      <a href="/hyr" className="btn-secondary w-full">
        {t.idea.proposeExpert}
      </a>
    );
  }

  function close() {
    setOpen(false);
    setMode("search");
    setQ("");
    setResults([]);
  }

  async function runSearch(value: string) {
    setQ(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchExperts(value);
      if (res.ok) setResults(res.data?.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function pick(expertId: string) {
    if (pending) return;
    setPending(true);
    const fd = new FormData();
    fd.set("ideaId", ideaId);
    fd.set("expertId", expertId);
    try {
      const res = await proposeExistingExpert(fd);
      if (res.ok) {
        toast(t.toast.expertNominated, "success");
        close();
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setPending(false);
    }
  }

  async function submitNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (areas.length < 1) {
      toast("Zgjidh të paktën një fushë.", "error");
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("ideaId", ideaId);
    fd.delete("areas");
    for (const a of areas) fd.append("areas", a);
    try {
      const res = await proposeNewExpert(fd);
      if (res.ok) {
        toast(t.toast.expertNominated, "success");
        close();
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full">
        {t.idea.proposeExpert}
      </button>
      <Modal open={open} onClose={close} title={t.idea.proposeExpert}>
        {mode === "search" ? (
          <div className="space-y-4">
            <p className="hint">{t.forms.typeaheadHint}</p>
            <input
              autoFocus
              value={q}
              onChange={(e) => runSearch(e.target.value)}
              placeholder={t.forms.searchExpertPh}
              className="input"
            />
            {searching && <p className="text-sm text-muted">{t.common.loading}</p>}
            {results.length > 0 && (
              <ul className="space-y-2">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => pick(r.id)}
                      disabled={pending}
                      className="w-full rounded-[10px] border border-border bg-card p-3 text-left hover:border-teal/40 disabled:opacity-60"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-ink">{r.name}</span>
                        {r.areas.map((a) => (
                          <span key={a} className="chip">
                            {fieldShort(a)}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-muted">{r.bio}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {q.trim().length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-muted">{t.forms.noExpertFound}</p>
            )}
            <div className="border-t border-border pt-3">
              <button type="button" className="btn-primary w-full" onClick={() => setMode("new")}>
                {t.forms.proposeNewPerson}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitNew} className="space-y-4">
            <p className="rounded-[10px] bg-teal-tint/50 p-3 text-xs text-teal-dk">{t.forms.nominateNote}</p>
            <div>
              <span className="label">{t.forms.expAreas}</span>
              <AreaPicker value={areas} onChange={setAreas} />
            </div>
            <div>
              <label className="label" htmlFor="nm-name">
                {t.forms.nomName}
              </label>
              <input id="nm-name" name="name" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="nm-bio">
                {t.forms.nomBio}
              </label>
              <textarea id="nm-bio" name="bio" required rows={3} className="input resize-y" />
            </div>
            <div>
              <label className="label" htmlFor="nm-reason">
                {t.forms.nomReason}
              </label>
              <textarea id="nm-reason" name="reason" required rows={2} className="input resize-y" />
            </div>
            <div>
              <label className="label" htmlFor="nm-contact">
                {t.forms.nomContact}
              </label>
              <input id="nm-contact" name="contact" required className="input" placeholder="Email ose telefon i propozuari" />
              <p className="hint">{t.forms.nomContactHint}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="nm-pname">
                  {t.forms.nomProposerName}
                </label>
                <input id="nm-pname" name="proposerName" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="nm-pcontact">
                  {t.forms.nomProposerContact}
                </label>
                <input id="nm-pcontact" name="proposerContact" required className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="nm-cv">
                {t.forms.nomCv}
              </label>
              <input id="nm-cv" name="cv" type="file" accept="application/pdf" className="input" />
            </div>
            <div className="flex justify-between gap-2">
              <button type="button" onClick={() => setMode("search")} className="btn-ghost">
                ← {t.forms.backToSearch}
              </button>
              <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
                {pending ? t.common.loading : t.forms.nominateSubmit}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
