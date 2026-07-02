"use client";

import { useState } from "react";
import { respondToLinkByToken } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

type Outcome = "accepted" | "rejected" | "invalid" | "already";

const message = (o: Outcome) =>
  o === "accepted"
    ? t.experts.linkAccepted
    : o === "rejected"
      ? t.experts.linkRejected
      : o === "already"
        ? t.experts.confirmAlready
        : t.experts.confirmInvalid;

/**
 * Accept/refuse an idea-link by email token. The decision fires only on an
 * explicit button press (a POST via server action) — never on the GET render,
 * so email link scanners can't accept or refuse on the user's behalf.
 */
export function LinkConfirm({ token }: { token: string }) {
  const toast = useToast();
  const [pending, setPending] = useState<"prano" | "refuzo" | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  async function decide(decision: "prano" | "refuzo") {
    if (pending) return;
    setPending(decision);
    try {
      const res = await respondToLinkByToken(token, decision);
      if (res.ok) {
        setOutcome(res.data?.outcome ?? "invalid");
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setPending(null);
    }
  }

  if (outcome) {
    const tone =
      outcome === "accepted"
        ? "bg-teal-tint text-teal-dk"
        : "bg-paper text-muted";
    return (
      <div className={`rounded-[10px] p-4 text-sm ${tone}`}>
        {message(outcome)}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => decide("prano")}
        disabled={Boolean(pending)}
        className="btn-primary disabled:opacity-60"
      >
        {pending === "prano" ? t.common.loading : t.experts.confirmAccept}
      </button>
      <button
        type="button"
        onClick={() => decide("refuzo")}
        disabled={Boolean(pending)}
        className="btn-danger-soft disabled:opacity-60"
      >
        {pending === "refuzo" ? t.common.loading : t.experts.confirmReject}
      </button>
    </div>
  );
}
