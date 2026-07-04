import type { Metadata } from "next";
import { FloatingBlobs } from "@/components/FloatingBlobs";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.about.title };

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs
        opacity={0.07}
        blobs={[
          { color: "#B71C1C", top: "-10%", left: "75%", size: 260, anim: "animate-blob-a" },
          { color: "#2F8F7A", top: "60%", left: "-6%", size: 240, anim: "animate-blob-b" },
        ]}
      />
      <div className="container-pal relative py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight">
          {t.about.title}
        </h1>

        <section className="mt-10">
          <h2 className="text-xl font-bold">{t.about.missionTitle}</h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted">
            {t.about.mission.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">{t.about.principlesTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {t.about.principlesIntro}
          </p>
          <ul className="mt-4 space-y-2">
            {t.about.principles.map((p, i) => (
              <li key={i} className="flex gap-3 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" id="rregullat">
          <h2 className="text-xl font-bold">{t.about.rulesTitle}</h2>
          <ol className="mt-3 space-y-2">
            {t.about.rules.map((r, i) => (
              <li key={i} className="flex gap-3 text-muted">
                <span className="font-bold text-teal">{i + 1}.</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <div className="card border-danger/30 bg-danger-tint/40 p-5">
            <h2 className="text-lg font-bold text-danger">
              {t.about.penaltyTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {t.about.penalty}
            </p>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
