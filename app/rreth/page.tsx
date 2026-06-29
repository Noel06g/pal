import type { Metadata } from "next";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: t.about.title };

export default function AboutPage() {
  return (
    <div className="container-pal py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight">{t.about.title}</h1>

        <section className="mt-10">
          <h2 className="text-xl font-bold">{t.about.missionTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{t.about.mission}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">{t.about.principlesTitle}</h2>
          <ul className="mt-3 space-y-2">
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
            <h2 className="text-lg font-bold text-danger">{t.about.penaltyTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">{t.about.penalty}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
