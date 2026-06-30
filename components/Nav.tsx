"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationsBell } from "@/components/NotificationsBell";
import { doSignOut } from "@/app/actions/auth";
import { t } from "@/lib/strings";

type NavUser = { name: string; isAdmin: boolean } | null;
type Notif = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

const links = [
  { href: "/rreth", label: t.nav.about },
  { href: "/ekspertet", label: t.nav.experts },
  { href: "/idete", label: t.nav.ideas },
];

export function Nav({
  user,
  notifications,
  unreadCount,
}: {
  user: NavUser;
  notifications: Notif[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper/90 backdrop-blur">
      <div className="container-pal flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-base font-extrabold leading-none tracking-tight text-teal sm:text-lg lg:text-xl"
        >
          {t.site.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Kryesore">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "rounded-md px-3 py-2 text-sm font-medium",
                isActive(l.href) ? "bg-teal-tint text-teal-dk" : "text-ink hover:bg-teal-tint",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/ekspertet" className="btn-secondary hidden lg:inline-flex">
            {t.nav.newExpert}
          </Link>
          <Link href="/idete/krijo" className="btn-primary hidden sm:inline-flex">
            {t.nav.newIdea}
          </Link>

          {user ? (
            <>
              <NotificationsBell notifications={notifications} unreadCount={unreadCount} />
              <div className="hidden items-center gap-1 md:flex">
                {user.isAdmin && (
                  <Link href="/admin" className="btn-ghost text-sm">
                    {t.nav.admin}
                  </Link>
                )}
                <Link href="/llogaria" className="btn-ghost text-sm">
                  {t.nav.account}
                </Link>
                <form action={doSignOut}>
                  <button type="submit" className="btn-ghost text-sm">
                    {t.nav.signOut}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link href="/hyr" className="btn-secondary hidden md:inline-flex">
              {t.nav.signIn}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-md p-2 text-ink hover:bg-teal-tint md:hidden"
            aria-label={t.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              {open ? (
                <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-paper md:hidden" aria-label="Mobile">
          <div className="container-pal flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={[
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(l.href) ? "bg-teal-tint text-teal-dk" : "text-ink hover:bg-teal-tint",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/ekspertet"
              onClick={() => setOpen(false)}
              className="btn-secondary mt-1"
            >
              {t.nav.newExpert}
            </Link>
            <Link
              href="/idete/krijo"
              onClick={() => setOpen(false)}
              className="btn-primary mt-1"
            >
              {t.nav.newIdea}
            </Link>
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="btn-ghost justify-start">
                    {t.nav.admin}
                  </Link>
                )}
                <Link href="/llogaria" onClick={() => setOpen(false)} className="btn-ghost justify-start">
                  {t.nav.account}
                </Link>
                <form action={doSignOut}>
                  <button type="submit" className="btn-ghost w-full justify-start">
                    {t.nav.signOut}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/hyr" onClick={() => setOpen(false)} className="btn-secondary">
                {t.nav.signIn}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
