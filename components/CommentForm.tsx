"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "@/app/actions/comments";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function CommentForm({ ideaId, loggedIn }: { ideaId: string; loggedIn: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <div className="card p-4 text-sm text-muted">
        <a href="/hyr" className="link-underline font-semibold">
          {t.idea.commentLogin}
        </a>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await addComment(fd);
      if (res.ok) {
        toast(t.toast.commented, "success");
        form.reset();
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
    <form onSubmit={onSubmit} className="card space-y-4 p-4">
      <input type="hidden" name="ideaId" value={ideaId} />
      <div>
        <label className="label" htmlFor="comment-body">
          {t.forms.commentBody}
        </label>
        <textarea
          id="comment-body"
          name="body"
          required
          rows={3}
          maxLength={4000}
          className="input resize-y"
          placeholder={t.forms.commentBodyPh}
        />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <fieldset>
          <legend className="label">{t.forms.commentStance}</legend>
          <div className="flex gap-2" role="radiogroup">
            {(["PRO", "KUNDER", "NEUTRAL"] as const).map((s, i) => (
              <label
                key={s}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-sm font-medium has-[:checked]:border-teal has-[:checked]:bg-teal-tint has-[:checked]:text-teal-dk"
              >
                <input
                  type="radio"
                  name="stance"
                  value={s}
                  defaultChecked={i === 0}
                  className="accent-teal"
                  required
                />
                {t.stance[s]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isSolution" className="h-4 w-4 accent-teal" />
          {t.forms.commentIsSolution}
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? t.common.loading : t.forms.commentSubmit}
      </button>
    </form>
  );
}
