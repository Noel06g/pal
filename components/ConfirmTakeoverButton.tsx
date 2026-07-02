"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authorConfirmTakeover } from "@/app/actions/experts";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function ConfirmTakeoverButton({ linkId }: { linkId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) return;
    setPending(true);
    try {
      const res = await authorConfirmTakeover(linkId);
      if (res.ok) {
        toast(t.toast.takeoverConfirmed, "success");
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
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="btn-primary w-full text-xs disabled:opacity-60"
    >
      {pending ? t.common.loading : t.idea.confirmTakeover}
    </button>
  );
}
