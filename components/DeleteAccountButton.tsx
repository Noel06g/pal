"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/app/actions/account";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function DeleteAccountButton() {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) return;
    if (!window.confirm(t.account.deleteConfirm)) return;
    setPending(true);
    try {
      const res = await deleteAccount();
      if (res.ok) {
        toast(t.toast.accountDeleted, "success");
        router.push("/");
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
    <button type="button" onClick={onClick} disabled={pending} className="btn-danger disabled:opacity-60">
      {pending ? t.common.loading : t.account.deleteBtn}
    </button>
  );
}
