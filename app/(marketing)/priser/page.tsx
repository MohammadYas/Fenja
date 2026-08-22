import Link from "next/link";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { AbonnementValg } from "@/components/abonnement-valg";
import { JsonLd } from "@/components/json-ld";
import { Stempel } from "@/components/ui/stempel";
import { Reveal } from "@/components/reveal";
import { priserGraf } from "@/lib/seo/jsonld";

export const metadata = {
  title: `${da.priserSide.titel} · ${da.site.navn}`,
  description: da.priserSide.lead,
  alternates: { canonical: "/priser" },
};

// Priser-siden (HANDOFF §3-strukturen): går et lag dybere end landing-sektionen —
// pakkerne som redaktionelle prisrækker på gran og kreditmodellen forklaret
// ærligt. Én mærkat pr. view.
export default function PriserSide() {
  return (
    <main>
      {/* Kreditpakkerne som produkt + tilbud (DKK) til rich results/LLM */}
      <JsonLd data={priserGraf()} />
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <Reveal>
          <h1 className="font-display text-kaempe font-bold">
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

      {/* Abonnementerne (S36, ejer-ordre 2026-08-16: standardvejen): gran-blok
          med redaktionelle prisrækker + md./år-skifte. Pakkerne er ude af
          UI'et — top-up bor på kreditsiden og vises kun ved tom saldo. */}
      <section className="bg-gran text-kalk" aria-label={da.priserSide.abonnement.titel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="font-mono text-detalje font-bold tracking-wide text-hoer">
              {da.priserSide.abonnement.titel}
            </h2>
            <p className="mt-3 max-w-laesbar text-kalk/80">
              {da.priserSide.abonnement.lead}
            </p>
          </Reveal>
          <Reveal forsinkelseTrin={1}>
            <AbonnementValg koebAktiv={false} tone="gran" className="mt-8" />
          </Reveal>
        </div>
      </section>

      {/* Engangspakker OFFENTLIGT (omsætnings-audit 21/8, punkt 1): pakkerne
          lå kun bag login, så en ny besøgende kun så "bind dig månedligt" og
          aldrig opdagede 49-kroners-indgangen. De står nu her, under
          abonnementet, med den ærlige ramme: abonnement er billigst pr.
          kredit — pakker er for dig, der sælger sjældnere. */}
      <section className="border-b border-kant" aria-label={da.priserSide.pakker.titel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="font-display text-display font-bold">
              {da.priserSide.pakker.titel}
            </h2>
            <p className="mt-3 max-w-laesbar text-tekst/80">
              {da.priserSide.pakker.lead}
            </p>
          </Reveal>
          <div className="mt-8 border-t border-kant">
            {kreditter.pakker.map((pakke, i) => (
              <Reveal key={pakke.id} forsinkelseTrin={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-kant py-5">
                  <div className="min-w-0">
                    <p className="font-display text-titel font-semibold">
                      {da.kreditter.pakkeNavne[pakke.id] ?? pakke.id}
                      {pakke.id === kreditter.anbefaletPakkeId ? (
                        <span className="ml-2 font-mono text-detalje font-normal uppercase tracking-wide text-gran">
                          {da.kreditter.anbefalet}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 font-mono text-detalje text-tekst/70">
                      {da.kreditter.pakkeAntal(pakke.antal)} ·{" "}
                      {da.kreditter.prisPrStk(
                        (pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","),
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-titel font-bold">
                    {da.kreditter.pakkePris(pakke.prisDkk)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-6 max-w-laesbar text-detalje text-tekst/70">
              {da.priserSide.pakker.note}
            </p>
            <Link href="/log-ind?videre=/kreditter" className="knap-link mt-6">
              {da.priserSide.pakker.knap}
            </Link>
          </Reveal>
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
          <Link href="/log-ind" className="knap-link mt-8">
            {da.priserSide.ctaKnap}
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
