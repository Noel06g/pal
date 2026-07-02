"use client";

import { useEffect, useState } from "react";
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

/** The only brand graphic on the site: a pure-blue square stamp. */
function Stamp() {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center bg-stamp text-[12px] font-bold tracking-wide text-white"
      aria-hidden
    >
      PS
    </span>
  );
}

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

  // Close the mobile menu with Escape (keyboard parity with click-toggle).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navLinkClass = (active: boolean) =>
    [
      "px-1 py-2 text-sm underline decoration-1 underline-offset-4 transition-colors",
      active
        ? "font-semibold text-ink decoration-ink"
        : "text-teal hover:text-teal-dk",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-paper">
      <div className="container-pal flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Stamp />
          <span className="hidden text-base font-semibold leading-none tracking-tight text-ink sm:inline">
            {t.site.name}
          </span>
        </Link>

        {/* Desktop nav — underlined document links. */}
        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label="Kryesore"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={navLinkClass(isActive(l.href))}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/idete/krijo"
            className="btn-primary hidden sm:inline-flex"
          >
            {t.nav.newIdea}
          </Link>

          {user ? (
            <>
              <NotificationsBell
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <div className="hidden items-center gap-4 md:flex">
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className={navLinkClass(isActive("/admin"))}
                  >
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  href="/llogaria"
                  className={navLinkClass(isActive("/llogaria"))}
                >
                  {t.nav.account}
                </Link>
                <form action={doSignOut}>
                  <button type="submit" className={navLinkClass(false)}>
                    {t.nav.signOut}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <Link
              href="/hyr"
              className={`hidden md:inline ${navLinkClass(false)}`}
            >
              {t.nav.signIn}
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="p-2 text-ink hover:text-teal-dk md:hidden"
            aria-label={t.nav.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden
            >
              {open ? (
                <path
                  d="M5 5l12 12M17 5L5 17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h16M3 11h16M3 16h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          id="mobile-menu"
          className="border-t border-border bg-paper md:hidden"
          aria-label="Mobile"
        >
          <div className="container-pal flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`py-2 ${navLinkClass(isActive(l.href))}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/idete/krijo"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 self-start"
            >
              {t.nav.newIdea}
            </Link>
            <div className="my-3 h-px bg-border" />
            {user ? (
              <>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className={`py-2 ${navLinkClass(false)}`}
                  >
                    {t.nav.admin}
                  </Link>
                )}
                <Link
                  href="/llogaria"
                  onClick={() => setOpen(false)}
                  className={`py-2 ${navLinkClass(false)}`}
                >
                  {t.nav.account}
                </Link>
                <form action={doSignOut}>
                  <button
                    type="submit"
                    className={`py-2 text-left ${navLinkClass(false)}`}
                  >
                    {t.nav.signOut}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/hyr"
                onClick={() => setOpen(false)}
                className={`py-2 ${navLinkClass(false)}`}
              >
                {t.nav.signIn}
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
