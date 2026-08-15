import Link from "next/link";
import { da } from "@/lib/copy/da";
import { kreditter } from "@/lib/config";
import { Prislap } from "@/components/ui/prislap";
import { Stempel } from "@/components/ui/stempel";
import { Reveal } from "@/components/reveal";
import { Toerresnor, ToerresnorLap } from "@/components/toerresnor";

export const metadata = {
  title: `${da.priserSide.titel} · ${da.site.navn}`,
  description: da.priserSide.lead,
};

const ctaKlasser =
  "inline-flex min-h-touch items-center rounded-bloed bg-primaer px-6 font-medium text-primaer-tekst shadow-offset-hoer transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset-hoer-loeft";

// Priser-siden (HANDOFF §3-strukturen): går et lag dybere end landing-sektionen —
// pakkerne som prislapper på gran og kreditmodellen forklaret ærligt. Ét stempel
// pr. view (REDESIGN §5.3).
export default function PriserSide() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <Reveal>
          <h1 className="font-display text-kaempe font-bold uppercase">
            {da.priserSide.titel}
          </h1>
          <p className="mt-4 max-w-laesbar text-lead text-tekst/80">
            {da.priserSide.lead}
          </p>
          <p className="mt-6">
            <Stempel>{da.priserSide.stempel}</Stempel>
          </p>
        </Reveal>
      </section>

      {/* Pakkerne: gran-blok med prislapper — samme motiv som landing (REDESIGN §3.1) */}
      <section className="bg-gran text-kalk" aria-label={da.priserSide.pakkerTitel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="font-mono text-detalje font-bold uppercase tracking-wide text-hoer">
              {da.priserSide.pakkerTitel}
            </h2>
          </Reveal>
          <div className="mt-6">
            <Toerresnor>
              {kreditter.pakker.map((pakke, i) => (
                <ToerresnorLap key={pakke.id} indeks={i}>
                  <Reveal forsinkelseTrin={i}>
                    <Prislap rotation={i % 2 === 0 ? "venstre" : "hoejre"}>
                      <p className="font-mono text-titel font-bold">
                        {da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)}
                      </p>
                      <p className="mt-1 font-mono text-detalje text-tekst/70">
                        {da.kreditter.prisPrStk(
                          (pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","),
                        )}
                      </p>
                      <div className="stregkode mt-3" aria-hidden="true" />
                    </Prislap>
                  </Reveal>
                </ToerresnorLap>
              ))}
            </Toerresnor>
          </div>
        </div>
      </section>

      {/* Kreditmodellen, ærligt forklaret */}
      <section className="bg-flade" aria-label={da.priserSide.saadanTitel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="max-w-2xl font-display text-display font-bold">
              {da.priserSide.saadanTitel}
            </h2>
          </Reveal>
          {/* dt/dd må højst have ét div-lag mellem sig og dl (a11y) — Reveal
              bærer derfor selv layout-klasserne */}
          <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {da.priserSide.punkter.map((punkt, i) => (
              <Reveal
                key={punkt.overskrift}
                forsinkelseTrin={i}
                className="max-w-laesbar"
              >
                <dt className="font-display text-titel font-bold">
                  {punkt.overskrift}
                </dt>
                <dd className="mt-2 text-tekst/80">{punkt.tekst}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ (U1): svar på det, resten af siden ikke selv siger — rækker med
          søm-delelinjer som Lær-indekset, ingen akkordeon at gemme svar i */}
      <section className="mx-auto max-w-5xl px-4 py-16" aria-label={da.priserSide.faqTitel}>
        <Reveal>
          <h2 className="font-display text-display font-bold">
            {da.priserSide.faqTitel}
          </h2>
        </Reveal>
        <dl className="mt-6">
          {da.priserSide.faq.map((punkt, i) => (
            <Reveal
              key={punkt.spoergsmaal}
              forsinkelseTrin={i}
              className="border-t border-kant py-5"
            >
              <dt className="max-w-2xl font-display text-titel font-bold">
                {punkt.spoergsmaal}
              </dt>
              <dd className="mt-2 max-w-laesbar text-tekst/80">{punkt.svar}</dd>
            </Reveal>
          ))}
        </dl>
        <script
          type="application/ld+json"
          // Egen statisk copy fra da.ts — ikke brugerinput
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: da.priserSide.faq.map((punkt) => ({
                "@type": "Question",
                name: punkt.spoergsmaal,
                acceptedAnswer: { "@type": "Answer", text: punkt.svar },
              })),
            }),
          }}
        />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <Reveal>
          <h2 className="max-w-3xl font-display text-kaempe font-bold">
            {da.priserSide.ctaTitel}
          </h2>
          <Link href="/log-ind" className={`mt-8 ${ctaKlasser}`}>
            {da.priserSide.ctaKnap}
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
