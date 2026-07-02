"use client";

import { useState } from "react";
import { startSignIn } from "@/app/actions/auth";
import { Turnstile, resetTurnstile } from "@/components/Turnstile";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function AuthForm({ next }: { next?: string }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await startSignIn(fd);
      if (res.ok) {
        setSent(true);
      } else {
        toast(res.error, "error");
        // The submitted token was consumed by the server-side verify —
        // fetch a fresh one so the retry doesn't fail on a stale token.
        resetTurnstile();
      }
    } catch {
      toast(t.common.error, "error");
      resetTurnstile();
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-lg font-bold">{t.auth.checkEmail}</h2>
        <p className="mt-2 text-sm text-muted">{t.auth.checkEmailBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className="label" htmlFor="auth-name">
          {t.forms.authName}
        </label>
        <input id="auth-name" name="name" required minLength={3} className="input" placeholder={t.forms.authNamePh} autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="auth-email">
          {t.forms.authEmail}
        </label>
        <input id="auth-email" name="email" type="email" required className="input" placeholder="emri@example.al" autoComplete="email" />
      </div>
      <Turnstile />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? t.common.loading : t.forms.authSignIn}
      </button>
      <p className="hint text-center">{t.forms.authNote}</p>
    </form>
  );
}
