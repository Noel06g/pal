"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { proposeExpertGeneral } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { FIELDS } from "@/lib/fields";
import { t } from "@/lib/strings";

export function ProposeExpertGeneralButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <a href="/hyr" className="btn-primary">
        {t.idea.proposeExpert}
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await proposeExpertGeneral(fd);
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
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        {t.idea.proposeExpert}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t.idea.proposeExpert}>
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="rounded-[10px] bg-teal-tint/50 p-3 text-xs text-teal-dk">
            {t.forms.nominateNote}
          </p>

          <div>
            <label className="label" htmlFor="nomg-field">
              {t.forms.expField}
            </label>
            <select id="nomg-field" name="fieldKey" required className="input" defaultValue="">
              <option value="" disabled>
                {t.forms.chooseField}
              </option>
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.n}. {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="nomg-name">
              {t.forms.nomName}
            </label>
            <input id="nomg-name" name="name" required className="input" />
          </div>

          <div>
            <label className="label" htmlFor="nomg-bio">
              {t.forms.nomBio}
            </label>
            <textarea id="nomg-bio" name="bio" required rows={3} className="input resize-y" />
          </div>

          <div>
            <label className="label" htmlFor="nomg-reason">
              {t.forms.nomReason}
            </label>
            <textarea id="nomg-reason" name="reason" required rows={2} className="input resize-y" />
          </div>

          <div>
            <label className="label" htmlFor="nomg-contact">
              {t.forms.nomContact}
            </label>
            <input
              id="nomg-contact"
              name="contact"
              required
              className="input"
              placeholder="Email ose telefon i propozuari"
            />
            <p className="hint">Vetëm administratorët e faqes e shohin — për ta kontaktuar jashtë platformës.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="nomg-pname">
                {t.forms.nomProposerName}
              </label>
              <input id="nomg-pname" name="proposerName" required className="input" />
            </div>
            <div>
              <label className="label" htmlFor="nomg-pcontact">
                {t.forms.nomProposerContact}
              </label>
              <input id="nomg-pcontact" name="proposerContact" required className="input" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="nomg-cv">
              {t.forms.nomCv}
            </label>
            <input id="nomg-cv" name="cv" type="file" accept="application/pdf" className="input" />
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
