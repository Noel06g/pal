"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { submitReport } from "@/app/actions/reports";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function ReportButton({
  ideaId,
  commentId,
  loggedIn,
  variant = "link",
}: {
  ideaId?: string;
  commentId?: string;
  loggedIn: boolean;
  variant?: "link" | "button";
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const trigger =
    variant === "button" ? (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary w-full">
        {t.idea.report}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-muted hover:text-danger"
      >
        {t.idea.report}
      </button>
    );

  if (!loggedIn) {
    return (
      <a
        href="/hyr"
        className={variant === "button" ? "btn-secondary w-full" : "text-xs font-semibold text-muted hover:text-danger"}
      >
        {t.idea.report}
      </a>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submitReport(fd);
      if (res.ok) {
        toast(t.toast.reported, "success");
        setOpen(false);
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
      {trigger}
      <Modal open={open} onClose={() => setOpen(false)} title={t.idea.report}>
        <form onSubmit={onSubmit} className="space-y-4">
          {ideaId && <input type="hidden" name="ideaId" value={ideaId} />}
          {commentId && <input type="hidden" name="commentId" value={commentId} />}
          <div>
            <label className="label" htmlFor="report-reason">
              {t.forms.reportReason}
            </label>
            <textarea
              id="report-reason"
              name="reason"
              required
              rows={4}
              maxLength={2000}
              className="input resize-y"
              placeholder={t.forms.reportReasonPh}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={pending} className="btn-danger disabled:opacity-60">
              {t.forms.reportSubmit}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
