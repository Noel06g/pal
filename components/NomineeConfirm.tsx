"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmNominee } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

type Outcome = "accepted" | "rejected" | "invalid" | "already";

const message = (o: Outcome) =>
  o === "accepted"
    ? t.experts.confirmAccepted
    : o === "rejected"
      ? t.experts.confirmRejected
      : o === "already"
        ? t.experts.confirmAlready
        : t.experts.confirmInvalid;

export function NomineeConfirm({ token, initialAccept }: { token: string; initialAccept?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"choice" | "accept" | "done">(initialAccept ? "accept" : "choice");
  const [outcome, setOutcome] = useState<Outcome>("invalid");
  const [pending, setPending] = useState(false);

  async function reject() {
    if (pending) return;
    setPending(true);
    try {
      const res = await confirmNominee(token, "refuzo");
      if (res.ok) {
        setOutcome(res.data?.outcome ?? "rejected");
        setMode("done");
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setPending(false);
    }
  }

  async function accept(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await confirmNominee(token, "prano", fd);
      if (res.ok) {
        setOutcome(res.data?.outcome ?? "accepted");
        setMode("done");
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

  if (mode === "done") {
    return <div className="rounded-[10px] bg-teal-tint p-4 text-sm text-teal-dk">{message(outcome)}</div>;
  }

  if (mode === "accept") {
    return (
      <form onSubmit={accept} className="space-y-4">
        <p className="text-sm text-muted">{t.experts.confirmCvNote}</p>
        <div>
          <label className="label" htmlFor="cv">
            {t.forms.expCvRequired}
          </label>
          <input id="cv" name="cv" type="file" accept="application/pdf" className="input" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("choice")} className="btn-ghost">
            {t.common.cancel}
          </button>
          <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
            {pending ? t.common.loading : t.experts.confirmAccept}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-3">
      <button type="button" onClick={() => setMode("accept")} className="btn-primary">
        {t.experts.confirmAccept}
      </button>
      <button type="button" onClick={reject} disabled={pending} className="btn-danger-soft disabled:opacity-60">
        {t.experts.confirmReject}
      </button>
    </div>
  );
}
