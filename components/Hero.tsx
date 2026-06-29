import Link from "next/link";
import { t } from "@/lib/strings";

export function Hero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-teal-tint/60 to-paper">
      <div className="container-pal py-16 sm:py-20">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-dk">
          {t.site.footerNote}
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
          {t.home.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{t.home.heroSub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/idete/krijo" className="btn-primary text-base">
            {t.home.heroCtaPrimary}
          </Link>
          <Link href="/idete" className="btn-secondary text-base">
            {t.home.heroCtaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
