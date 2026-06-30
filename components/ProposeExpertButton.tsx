"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { proposeExpert } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { fieldName } from "@/lib/fields";
import { t } from "@/lib/strings";

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
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <a href="/hyr" className="btn-secondary w-full">
        {t.idea.proposeExpert}
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await proposeExpert(fd);
    setPending(false);
    if (res.ok) {
      toast(t.toast.expertNominated, "success");
      setOpen(false);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full">
        {t.idea.proposeExpert}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t.idea.proposeExpert}>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="fromIdeaId" value={ideaId} />
          <input type="hidden" name="fieldKey" value={fieldKey} />

          <p className="rounded-[10px] bg-teal-tint/50 p-3 text-xs text-teal-dk">
            {t.forms.nominateNote}
          </p>

          <div>
            <span className="label">{t.forms.nomFieldPrefilled}</span>
            <p className="rounded-[10px] border border-border bg-paper px-3.5 py-2.5 text-sm">
              {fieldName(fieldKey)}
            </p>
          </div>

          <div>
            <label className="label" htmlFor="nom-name">
              {t.forms.nomName}
            </label>
            <input id="nom-name" name="name" required className="input" />
          </div>

          <div>
            <label className="label" htmlFor="nom-bio">
              {t.forms.nomBio}
            </label>
            <textarea id="nom-bio" name="bio" required rows={3} className="input resize-y" />
          </div>

          <div>
            <label className="label" htmlFor="nom-reason">
              {t.forms.nomReason}
            </label>
            <textarea id="nom-reason" name="reason" required rows={2} className="input resize-y" />
          </div>

          <div>
            <label className="label" htmlFor="nom-contact">
              {t.forms.nomContact}
            </label>
            <input id="nom-contact" name="contact" required className="input" placeholder="Email ose telefon i propozuari" />
            <p className="hint">Vetëm administratorët e faqes e shohin — për ta kontaktuar jashtë platformës.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="nom-pname">
                {t.forms.nomProposerName}
              </label>
              <input id="nom-pname" name="proposerName" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="nom-pcontact">
                {t.forms.nomProposerContact}
              </label>
              <input id="nom-pcontact" name="proposerContact" required className="input" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="nom-cv">
              {t.forms.nomCv}
            </label>
            <input id="nom-cv" name="cv" type="file" accept="application/pdf" className="input" />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? t.common.loading : t.forms.nominateSubmit}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
