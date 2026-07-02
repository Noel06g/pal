import type { Metadata } from "next";
import Link from "next/link";
import { t } from "@/lib/strings";

export const metadata: Metadata = { title: "Kushtet e përdorimit" };

export default function TermsPage() {
  return (
    <div className="container-pal py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-balance text-4xl font-bold tracking-tight">
          Kushtet e përdorimit
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Duke përdorur {t.site.name}, pranon rregullat e komunitetit më poshtë.{" "}
          {t.site.name} është një nismë e pavarur qytetare.
        </p>

        <section className="mt-10">
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

        <section className="mt-10">
          <h2 className="text-xl font-bold">Përmbajtja dhe përgjegjësia</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Çdo përdorues është përgjegjës për përmbajtjen që publikon.{" "}
            {t.site.name} nuk përfaqëson asnjë parti politike apo institucion
            dhe nuk garanton zbatimin e ideve. Të gjitha tekstet trajtohen si
            tekst i thjeshtë.
          </p>
        </section>

        <p className="mt-10 text-sm text-muted">
          Shih edhe{" "}
          <Link href="/privatesia" className="link-underline">
            Politikën e privatësisë
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
