import Link from "next/link";
import Image from "next/image";
import { t } from "@/lib/strings";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-paper">
      <div className="container-pal py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Image
              src="/logo.png"
              alt={t.site.name}
              width={371}
              height={160}
              className="h-11 w-auto"
            />
            <p className="mt-3 text-sm text-muted">{t.site.footerNote}</p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm"
            aria-label="Footer"
          >
            <Link href="/rreth" className="link-underline">
              {t.nav.about}
            </Link>
            <Link href="/ekspertet" className="link-underline">
              {t.nav.experts}
            </Link>
            <Link href="/idete" className="link-underline">
              {t.nav.ideas}
            </Link>
            <Link href="/privatesia" className="link-underline">
              Privatësia
            </Link>
            <Link href="/kushtet" className="link-underline">
              Kushtet
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {t.site.name}. {t.site.footerNote}.
        </div>
      </div>
    </footer>
  );
}
