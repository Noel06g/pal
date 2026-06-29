"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { selfNominateExpert } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { FIELDS } from "@/lib/fields";
import { t } from "@/lib/strings";

export function SelfNominateButton({
  loggedIn,
  defaultName,
}: {
  loggedIn: boolean;
  defaultName?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <a href="/hyr" className="btn-primary">
        {t.experts.selfNominate}
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = await selfNominateExpert(fd);
    setPending(false);
    if (res.ok) {
      toast(t.toast.expertSelf, "success");
      setOpen(false);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        {t.experts.selfNominate}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t.experts.selfNominate}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="self-name">
              {t.forms.expName}
            </label>
            <input id="self-name" name="name" required defaultValue={defaultName} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="self-field">
              {t.forms.expField}
            </label>
            <select id="self-field" name="fieldKey" required className="input" defaultValue="">
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
            <label className="label" htmlFor="self-bio">
              {t.forms.expBio}
            </label>
            <textarea id="self-bio" name="bio" required rows={3} className="input resize-y" placeholder={t.forms.expBioPh} />
          </div>
          <div>
            <label className="label" htmlFor="self-reason">
              {t.forms.expReason}
            </label>
            <textarea id="self-reason" name="reason" required rows={2} className="input resize-y" placeholder={t.forms.expReasonPh} />
          </div>
          <div>
            <label className="label" htmlFor="self-contact">
              {t.forms.expContact}
            </label>
            <input id="self-contact" name="contact" required className="input" placeholder={t.forms.expContactPh} />
          </div>
          <div>
            <label className="label" htmlFor="self-cv">
              {t.forms.expCv}
            </label>
            <input id="self-cv" name="cv" type="file" accept="application/pdf" className="input" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
              {pending ? t.common.loading : t.forms.selfNominateSubmit}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
