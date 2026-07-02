"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";
import { t } from "@/lib/strings";

type Notif = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date | string;
};

export function NotificationsBell({
  notifications,
  unreadCount,
}: {
  notifications: Notif[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(unreadCount);
  const [items, setItems] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleOpenItem(n: Notif) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setCount((c) => Math.max(0, c - 1));
      await markNotificationRead(n.id).catch(() => {});
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setCount(0);
    await markAllNotificationsRead().catch(() => {});
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-ink hover:bg-teal-tint"
        aria-label={t.notifications.bellLabel}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5.5-1.5 5.5h12s-1.5-1.5-1.5-5.5A4.5 4.5 0 0 0 10 2.5ZM8.5 16a1.5 1.5 0 0 0 3 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-[12px] border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-bold">{t.notifications.title}</span>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-semibold text-teal hover:text-teal-dk"
              >
                {t.notifications.markAllRead}
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted">
                {t.notifications.empty}
              </li>
            )}
            {items.map((n) => {
              const content = (
                <div
                  className={[
                    "flex gap-2 px-4 py-3 text-sm",
                    n.read ? "text-muted" : "bg-teal-tint/40 text-ink",
                  ].join(" ")}
                >
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />
                  )}
                  <span className="flex-1">{n.message}</span>
                </div>
              );
              return (
                <li key={n.id} className="border-b border-border last:border-0">
                  {n.link ? (
                    <Link href={n.link} onClick={() => handleOpenItem(n)} className="block">
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenItem(n)}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
