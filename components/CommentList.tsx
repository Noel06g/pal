"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComment } from "@/app/actions/comments";
import { ReportButton } from "@/components/ReportButton";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

type Stance = "PRO" | "KUNDER" | "NEUTRAL";

export type CommentData = {
  id: string;
  body: string;
  stance: Stance;
  isSolution: boolean;
  authorName: string;
  createdAt: string;
  canDelete: boolean;
};

function StanceBadge({ stance }: { stance: Stance }) {
  const map: Record<Stance, string> = {
    PRO: "badge-ok",
    KUNDER: "badge-amber",
    NEUTRAL: "badge-muted",
  };
  return <span className={map[stance]}>{t.stance[stance]}</span>;
}

export function CommentList({
  comments,
  loggedIn,
}: {
  comments: CommentData[];
  loggedIn: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function onDelete(id: string) {
    if (pendingId) return;
    if (!window.confirm(t.idea.deleteCommentConfirm)) return;
    setPendingId(id);
    try {
      const res = await deleteComment(id);
      if (res.ok) {
        toast(t.toast.commentDeleted, "success");
        router.refresh();
      } else {
        toast(res.error, "error");
      }
    } catch {
      toast(t.common.error, "error");
    } finally {
      setPendingId(null);
    }
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted">Ende s&apos;ka komente. Bëhu i pari!</p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li key={c.id} className="card p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{c.authorName}</span>
            <StanceBadge stance={c.stance} />
            {c.isSolution && (
              <span className="badge-ok">★ {t.idea.proposesSolution}</span>
            )}
            <span className="ml-auto text-xs text-muted">{c.createdAt}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {c.body}
          </p>
          <div className="mt-3 flex items-center gap-4">
            {c.canDelete && (
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                disabled={pendingId === c.id}
                className="text-xs font-semibold text-danger hover:underline disabled:opacity-60"
              >
                {t.idea.deleteComment}
              </button>
            )}
            <ReportButton commentId={c.id} loggedIn={loggedIn} />
          </div>
        </li>
      ))}
    </ul>
  );
}
