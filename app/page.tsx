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

      {/* Propozo idenë dhe zgjidhjen tënde */}
      <section className="container-pal py-16">
        <div className="accent-bar" aria-hidden />
        <h2 className="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t.home.howTitle}
        </h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {t.home.how.map((step, i) => (
            <li key={i} className="card card-lift p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-teal to-teal-dk font-display text-lg font-extrabold text-white shadow-sm">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
