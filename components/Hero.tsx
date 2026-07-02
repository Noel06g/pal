import Link from "next/link";
import { t } from "@/lib/strings";

export type HeroStats = { ideas: number; experts: number } | null;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <dt className="order-2 text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="order-1 font-display text-3xl font-extrabold text-teal-dk">{value}</dd>
    </div>
  );
}

export function Hero({ stats }: { stats?: HeroStats }) {
  const showStats = Boolean(stats && (stats.ideas > 0 || stats.experts > 0));

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Layered background: base gradient, dot grid, two soft teal glows. */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-tint/70 via-paper to-paper" aria-hidden />
      <div
        className="absolute inset-0 [background-image:radial-gradient(rgba(19,97,92,0.09)_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden
      />
      <div className="absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-teal/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-44 left-[-8%] h-80 w-80 rounded-full bg-teal/[0.07] blur-3xl" aria-hidden />

      <div className="container-pal relative py-16 sm:py-24">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-teal-dk shadow-sm backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
          {t.site.footerNote}
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
          {t.home.heroTitle}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.home.heroSub}</p>
        <p className="mt-4 max-w-2xl text-lg font-bold text-ink">{t.home.heroTagline}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/ekspertet" className="btn-primary px-6 py-3 text-base">
            {t.home.heroCtaSecondary}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8h10m0 0L9 4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link href="/idete/krijo" className="btn-secondary bg-white/80 px-6 py-3 text-base backdrop-blur">
            {t.home.heroCtaPrimary}
          </Link>
        </div>

        {showStats && stats && (
          <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-4 border-t border-teal/15 pt-6">
            <Stat value={stats.ideas} label={t.home.statIdeas} />
            <Stat value={stats.experts} label={t.home.statExperts} />
            <Stat value={14} label={t.home.statFields} />
          </dl>
        )}
      </div>
    </section>
  );
}
