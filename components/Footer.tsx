import Link from "next/link";
import { t } from "@/lib/strings";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container-pal py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="text-xl font-extrabold tracking-tight text-teal">
              {t.site.name}
            </div>
            <p className="mt-2 text-sm text-muted">{t.site.footerNote}</p>
            {t.site.tempName ? (
              <p className="mt-1 text-xs text-muted">{t.site.tempName}</p>
            ) : null}
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm" aria-label="Footer">
            <Link href="/rreth" className="transition-colors text-ink hover:text-teal">
              {t.nav.about}
            </Link>
            <Link href="/ekspertet" className="transition-colors text-ink hover:text-teal">
              {t.nav.experts}
            </Link>
            <Link href="/idete" className="transition-colors text-ink hover:text-teal">
              {t.nav.ideas}
            </Link>
            <Link href="/privatesia" className="transition-colors text-ink hover:text-teal">
              Privatësia
            </Link>
            <Link href="/kushtet" className="transition-colors text-ink hover:text-teal">
              Kushtet
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {t.site.name}. {t.site.footerNote}.
        </div>
      </div>
    </footer>
  );
}
