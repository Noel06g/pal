import { Hero } from "@/components/Hero";
import { t } from "@/lib/strings";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Pse Platforma Shqiptare? */}
      <section className="border-b border-border bg-card/60">
        <div className="container-pal py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.whyTitle}</h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted">
              {t.home.why.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Propozo idenë dhe zgjidhjen tënde */}
      <section className="container-pal py-14">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.home.howTitle}</h2>
        <ol className="mt-8 grid gap-5 sm:grid-cols-3">
          {t.home.how.map((step, i) => (
            <li key={i} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-teal text-lg font-extrabold text-white">
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
