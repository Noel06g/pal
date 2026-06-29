"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleSupport } from "@/app/actions/support";
import { useToast } from "@/components/Toast";
import { t } from "@/lib/strings";

export function SupportButton({
  ideaId,
  initialSupported,
  initialCount,
  loggedIn,
  disabled,
}: {
  ideaId: string;
  initialSupported: boolean;
  initialCount: number;
  loggedIn: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [supported, setSupported] = useState(initialSupported);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  if (!loggedIn) {
    return (
      <a href="/hyr" className="btn-secondary w-full">
        {t.idea.supportLogin} ({count})
      </a>
    );
  }

  async function onClick() {
    if (pending || disabled) return;
    setPending(true);
    const res = await toggleSupport(ideaId);
    setPending(false);
    if (res.ok && res.data) {
      setSupported(res.data.supported);
      setCount(res.data.count);
      toast(res.data.supported ? t.toast.supported : t.toast.unsupported, "success");
      router.refresh();
    } else if (!res.ok) {
      toast(res.error, "error");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      aria-pressed={supported}
      className={[
        "w-full disabled:opacity-60",
        supported ? "btn-primary" : "btn-secondary",
      ].join(" ")}
    >
      <svg width="16" height="16" viewBox="0 0 14 14" fill={supported ? "currentColor" : "none"} aria-hidden>
        <path
          d="M7 12s-5-3.2-5-6.5A2.5 2.5 0 0 1 7 4a2.5 2.5 0 0 1 5 1.5C12 8.8 7 12 7 12Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      {supported ? t.idea.supported : t.idea.support} ({count})
    </button>
  );
}
