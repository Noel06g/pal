"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { selfRegisterExpert } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { AreaPicker } from "@/components/AreaPicker";
import { t } from "@/lib/strings";

export function SelfNominateButton({
  loggedIn,
  defaultName,
  variant = "primary",
}: {
  loggedIn: boolean;
  defaultName?: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const triggerClass = variant === "secondary" ? "btn-secondary" : "btn-primary";

  if (!loggedIn) {
    return (
      <a href="/hyr" className={triggerClass}>
        {t.experts.selfNominate}
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
    const res = await selfRegisterExpert(fd);
    setPending(false);
    if (res.ok) {
      toast(t.toast.expertSelf, "success");
      setOpen(false);
      setAreas([]);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {t.experts.selfNominate}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t.experts.selfNominate}>
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="rounded-[10px] bg-teal-tint/50 p-3 text-xs text-teal-dk">{t.forms.selfRegisterNote}</p>

          <div>
            <label className="label" htmlFor="self-name">
              {t.forms.expName}
            </label>
            <input id="self-name" name="name" required defaultValue={defaultName} className="input" />
          </div>

          <div>
            <span className="label">{t.forms.expAreas}</span>
            <AreaPicker value={areas} onChange={setAreas} />
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
              {t.forms.expCvRequired}
            </label>
            <input id="self-cv" name="cv" type="file" accept="application/pdf" required className="input" />
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
