"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { AreaPicker } from "@/components/AreaPicker";
import { proposeNewExpertGeneral } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

/** "Propozo një ekspert/e" from the experts directory — nominate a new person (no idea link). */
export function ProposeExpertGeneralButton({
  loggedIn,
  fieldKey,
}: {
  loggedIn: boolean;
  fieldKey?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const initialAreas = fieldKey && fieldKey !== "other" ? [fieldKey] : [];
  const [areas, setAreas] = useState<string[]>(initialAreas);

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
    if (areas.length < 1) {
      toast("Zgjidh të paktën një fushë.", "error");
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.delete("areas");
    for (const a of areas) fd.append("areas", a);
    try {
      const res = await proposeNewExpertGeneral(fd);
      if (res.ok) {
        toast(t.toast.expertNominated, "success");
        setOpen(false);
        setAreas(initialAreas);
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        {t.idea.proposeExpert}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t.idea.proposeExpert}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="rounded-[10px] bg-teal-tint/50 p-3 text-xs text-teal-dk">
            {t.forms.nominateNote}
          </p>
          <div>
            <span className="label">{t.forms.expAreas}</span>
            <AreaPicker value={areas} onChange={setAreas} />
          </div>
          <div>
            <label className="label" htmlFor="gp-name">
              {t.forms.nomName}
            </label>
            <input id="gp-name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="gp-bio">
              {t.forms.nomBio}
            </label>
            <textarea
              id="gp-bio"
              name="bio"
              required
              rows={3}
              className="input resize-y"
            />
          </div>
          <div>
            <label className="label" htmlFor="gp-reason">
              {t.forms.nomReason}
            </label>
            <textarea
              id="gp-reason"
              name="reason"
              required
              rows={2}
              className="input resize-y"
            />
          </div>
          <div>
            <label className="label" htmlFor="gp-contact">
              {t.forms.nomContact}
            </label>
            <input
              id="gp-contact"
              name="contact"
              required
              className="input"
              placeholder="Email ose telefon i propozuari"
            />
            <p className="hint">{t.forms.nomContactHint}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="gp-pname">
                {t.forms.nomProposerName}
              </label>
              <input
                id="gp-pname"
                name="proposerName"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="gp-pcontact">
                {t.forms.nomProposerContact}
              </label>
              <input
                id="gp-pcontact"
                name="proposerContact"
                required
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="gp-cv">
              {t.forms.nomCv}
            </label>
            <input
              id="gp-cv"
              name="cv"
              type="file"
              accept="application/pdf"
              className="input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="btn-primary disabled:opacity-60"
            >
              {pending ? t.common.loading : t.forms.nominateSubmit}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
