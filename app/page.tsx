import { Hero, type HeroStats } from "@/components/Hero";
import { WhySection } from "@/components/WhySection";
import { HowItWorks } from "@/components/HowItWorks";
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

      {/* Propozo idenë dhe zgjidhjen tënde — animated itinerary timeline. */}
      <section className="container-pal py-20 sm:py-28">
        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {t.home.howTitle}
        </h2>
        <HowItWorks />
      </section>
    </>
  );
}
