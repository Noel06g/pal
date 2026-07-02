import { Hero, type HeroStats } from "@/components/Hero";
import { WhySection } from "@/components/WhySection";
import { db } from "@/lib/db";
import { t } from "@/lib/strings";

export default async function HomePage() {
  // Live platform numbers for the hero. Purely decorative — never let a DB
  // hiccup take the homepage down.
  let stats: HeroStats = null;
  try {
    const [ideas, experts] = await Promise.all([
      db.idea.count(),
      db.expertProfile.count({ where: { status: "PUBLISHED" } }),
    ]);
    stats = { ideas, experts };
  } catch {
    stats = null;
  }

  return (
    <>
      <Hero stats={stats} />

      {/* Pse Platforma Shqiptare? */}
      <WhySection />

      {/* Propozo idenë dhe zgjidhjen tënde — plain columns, no card chrome. */}
      <section className="container-pal py-20 sm:py-28">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {t.home.howTitle}
        </h2>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3">
          {t.home.how.map((step, i) => (
            <li key={i}>
              <span
                className="flex h-8 w-8 items-center justify-center bg-stamp text-sm font-bold text-white"
                aria-hidden
              >
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
