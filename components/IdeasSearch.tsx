"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { t } from "@/lib/strings";

export function IdeasSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    router.push(`/idete?${next.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.ideas.searchPlaceholder}
        aria-label={t.ideas.searchPlaceholder}
        className="input"
      />
      <button type="submit" className="btn-secondary shrink-0">
        Kërko
      </button>
    </form>
  );
}
