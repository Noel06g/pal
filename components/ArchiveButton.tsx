"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveIdea } from "@/app/actions/ideas";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function ArchiveButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) return;
    if (!window.confirm(t.idea.archiveConfirm)) return;
    setPending(true);
    const res = await archiveIdea(ideaId);
    setPending(false);
    if (res.ok) {
      toast(t.toast.archived, "success");
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className="btn-secondary w-full disabled:opacity-60">
      {t.idea.archive}
    </button>
  );
}
