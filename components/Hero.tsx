import Link from "next/link";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HeroIllustration } from "@/components/HeroIllustration";
import { t } from "@/lib/strings";

export type HeroStats = { ideas: number; experts: number } | null;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <dt className="order-2 text-sm text-muted">{label}</dt>
      <dd className="order-1 text-2xl font-bold text-stamp">
        <AnimatedNumber value={value} />
      </dd>
    </div>
  );
}

export function Hero({ stats }: { stats?: HeroStats }) {
  const showStats = Boolean(stats && (stats.ideas > 0 || stats.experts > 0));

  return (
    <section className="container-pal py-16 sm:py-24">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_360px]">
        <div className="animate-fade-up">
          <p className="text-sm text-muted">{t.site.footerNote}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold leading-[1.2] tracking-tight text-ink sm:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="prose-col mt-6 text-lg leading-relaxed text-ink">
            {t.home.heroSub}
          </p>
          <p className="prose-col mt-4 text-lg font-semibold leading-relaxed text-ink">
            {t.home.heroTagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link href="/ekspertet" className="btn-primary px-6 py-3 text-base">
              {t.home.heroCtaSecondary}
            </Link>
            <Link
              href="/idete/krijo"
              className="link-underline text-base font-medium"
            >
              {t.home.heroCtaPrimary} →
            </Link>
          </div>

          {showStats && stats && (
            <dl className="mt-14 flex flex-wrap gap-x-14 gap-y-4 border-t border-border pt-6">
              <Stat value={stats.ideas} label={t.home.statIdeas} />
              <Stat value={stats.experts} label={t.home.statExperts} />
              <Stat value={14} label={t.home.statFields} />
            </dl>
          )}
        </div>

        {/* The one moment of color the system permits. */}
        <HeroIllustration
          className="animate-fade-up mx-auto hidden w-full max-w-[360px] lg:block"
          style={{ animationDelay: "150ms" }}
        />
      </div>
    </section>
  );
}
