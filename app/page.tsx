import { Hero, type HeroStats } from "@/components/Hero";
import { WhySection } from "@/components/WhySection";
import { HowItWorks } from "@/components/HowItWorks";
import { FloatingBlobs } from "@/components/FloatingBlobs";
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
      <section className="relative overflow-hidden">
        <FloatingBlobs
          opacity={0.09}
          blobs={[
            { color: "#D32F2F", top: "-15%", left: "78%", size: 320, anim: "animate-blob-a" },
            { color: "#2F8F7A", top: "60%", left: "-6%", size: 280, anim: "animate-blob-b" },
            { color: "#E8A33D", top: "10%", left: "30%", size: 220, anim: "animate-blob-a" },
          ]}
        />
        <div className="container-pal py-20 sm:py-28">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.home.howTitle}
          </h2>
          <HowItWorks />
        </div>
      </section>
    </>
  );
}
