import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Politika e privatësisë" };

const APP = process.env.NEXT_PUBLIC_SITE_NAME ?? "Platforma Shqiptare";

export default function PrivacyPage() {
  return (
    <div className="container-pal py-12">
      <div className="mx-auto max-w-2xl prose-pal space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tight">Politika e privatësisë</h1>
          <p className="mt-2 text-sm text-muted">
            E përditësuar së fundi: {new Date().toLocaleDateString("sq-AL", { dateStyle: "long" })}
          </p>
        </header>

        <Section title="1. Kontrolluesi i të dhënave">
          <p>
            {APP} është një nismë e pavarur qytetare. Kontrolluesi i të dhënave është operatori i platformës.
            Për çdo kërkesë lidhur me të dhënat e tua, na kontakto në:{" "}
            <span className="font-semibold text-ink">[vendos email-in e kontaktit]</span>.
          </p>
        </Section>

        <Section title="2. Çfarë të dhënash mbledhim">
          <ul>
            <li><strong>Të dhëna llogarie:</strong> emri i plotë dhe email-i (për hyrje pa fjalëkalim).</li>
            <li><strong>Përmbajtje:</strong> idetë, komentet dhe mbështetjet që krijon.</li>
            <li><strong>Të dhëna ekspertësh:</strong> emër, fushë, biografi (publike); kontakt, arsye dhe CV (private).</li>
            <li>
              <strong>Të dhëna të palëve të treta:</strong> kur propozon dikë si ekspert, vendos emrin dhe
              kontaktin e tij/saj. Profili i propozuar mbetet jopublik derisa personi ta pranojë me email — ky
              pranim është mekanizmi i pëlqimit.
            </li>
          </ul>
        </Section>

        <Section title="3. Pse i përdorim">
          <p>
            Për të mundësuar funksionimin e platformës: publikimin e ideve, diskutimin, ndërlidhjen me ekspertë,
            njoftimet me email dhe moderimin kundër abuzimit. Nuk i shesim të dhënat dhe nuk i përdorim për reklama.
          </p>
        </Section>

        <Section title="4. Kush i sheh">
          <ul>
            <li><strong>Publike:</strong> emri i autorit, idetë, komentet, dokumentet mbështetëse, dhe për ekspertët vetëm emri, fusha e biografia.</li>
            <li><strong>Private (vetëm administrata):</strong> kontaktet e ekspertëve, CV-të, arsyet dhe të dhënat e propozuesit.</li>
          </ul>
        </Section>

        <Section title="5. Ruajtja">
          <p>
            Të dhënat ruhen për aq kohë sa llogaria është aktive ose sa nevojitet për qëllimet e mësipërme.
            Dokumentet ruhen në një hapësirë private dhe shërbehen vetëm përmes aksesit të kontrolluar.
          </p>
        </Section>

        <Section title="6. Të drejtat e tua">
          <p>
            Ke të drejtë të aksesosh, korrigjosh dhe fshish të dhënat e tua. Mund ta fshish llogarinë në çdo
            kohë nga faqja{" "}
            <Link href="/llogaria" className="link-underline">Llogaria ime</Link> — kjo heq përfundimisht të
            dhënat e tua personale, idetë, komentet dhe mbështetjet.
          </p>
        </Section>

        <Section title="7. Siguria">
          <p>
            Përdorim hyrje pa fjalëkalim (lidhje magjike me email), lidhje të enkriptuar (HTTPS), mbrojtje
            kundër robotëve dhe kufizime kundër abuzimit. Asnjë sistem nuk është 100% i sigurt, por marrim masa
            të arsyeshme teknike dhe organizative.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-2 leading-relaxed text-muted [&_a]:text-teal [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
