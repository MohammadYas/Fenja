import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SektionsMarkoer } from "@/components/sektions-markoer";
import { Prislap } from "@/components/ui/prislap";
import { Stempel } from "@/components/ui/stempel";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";

export const metadata = {
  title: `${da.site.navn} — ${da.landing.heroTitel}`,
  description: da.site.beskrivelse,
};

// CTA-link i knap-stil (kan ikke bruge <Button> — det er navigation, ikke action).
const ctaKlasser =
  "inline-flex min-h-touch items-center rounded-bloed bg-primaer px-6 font-medium text-primaer-tekst shadow-offset-hoer transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset-hoer-loeft";

// Landing page (F-1) i v2-retningen "katalog møder plakat" (REDESIGN §3.1):
// plakat-hero, farveblokke, rav-mono-tal og prislapper. Hero-billederne SKAL
// udskiftes med ægte app-output efter S12 (Gate 1) — indtil da en ærligt mærket
// pladsholder, aldrig opstillede eksempler (§2.1.7).
export default function Forside() {
  return (
    <main>
      {/* Plakat-hero: overskriften ER hero-grafikken (REDESIGN §2.1) */}
      <section className="overflow-x-clip">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:pt-16">
          <h1 className="font-display text-plakat font-bold uppercase">
            {da.landing.heroPlakatLinjer.map((ord) => (
              <span key={ord} className="block">
                {ord}
              </span>
            ))}
            <span className="block text-rav">{da.landing.heroPlakatFremhaevet}</span>
          </h1>
          <p className="mt-6 max-w-laesbar text-lead text-tekst/80">
            {da.landing.heroTekst}
          </p>
          <Link href="/log-ind" className={`mt-6 ${ctaKlasser}`}>
            {da.landing.heroKnap}
          </Link>

          {/* Signatur-beviset: before/after med Sømmen, skubbet op i heroen,
              let roteret, med "2 min"-stempel (REDESIGN §3.1) */}
          <Reveal>
            <figure className="relative mt-12 md:mt-16">
              <div className="rotate-ramme">
                <div className="flex overflow-hidden rounded-bloed border-2 border-koks bg-baggrund shadow-offset-hoer">
                  <div className="flex aspect-[4/5] flex-1 items-end bg-hoer p-3">
                    <span className="rounded-stram bg-baggrund px-2 py-0.5 font-mono text-detalje uppercase tracking-wide">
                      {da.landing.heroFoer}
                    </span>
                  </div>
                  <div className="soem shrink-0" aria-hidden="true" />
                  <div className="flex aspect-[4/5] flex-1 items-end bg-kalk p-3">
                    <span className="rounded-stram bg-flade px-2 py-0.5 font-mono text-detalje uppercase tracking-wide">
                      {da.landing.heroEfter}
                    </span>
                  </div>
                </div>
                <div className="absolute -top-4 right-6">
                  <Stempel className="bg-baggrund">{da.landing.heroStempel}</Stempel>
                </div>
              </div>
              <figcaption className="mt-4 text-detalje text-tekst/70">
                {da.landing.heroPladsholder}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Sådan virker det: kæmpe rav-tal der stikker ud af venstre kant,
          indhold forskudt asymmetrisk (REDESIGN §3.1) */}
      <section className="overflow-x-clip" aria-label={da.landing.saadanTitel}>
        <div className="mx-auto max-w-5xl px-4 py-14">
          <SektionsMarkoer nr={1} titel={da.landing.saadanTitel} />
          <ol className="mt-10 flex flex-col gap-12">
            {da.landing.saadanTrin.map((trin, i) => (
              <li
                key={trin.titel}
                className={`relative pl-12 md:pl-20 ${
                  i === 1 ? "md:ml-24" : i === 2 ? "md:ml-48" : ""
                }`}
              >
                <Reveal forsinkelseTrin={i}>
                  <span
                    aria-hidden="true"
                    className="absolute -left-7 top-0 select-none font-mono text-kaempe font-bold leading-none text-rav md:-left-9"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-titel font-semibold">
                    {trin.titel}
                  </h3>
                  <p className="mt-2 max-w-laesbar text-tekst/80">{trin.tekst}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ærligheds-blok: hør-grund (REDESIGN §2.2) */}
      <section className="bg-flade">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <Reveal>
            <SektionsMarkoer nr={2} />
            <h2 className="mt-4 font-display text-display font-semibold">
              {da.landing.aerligTitel}
            </h2>
            <p className="mt-3 max-w-laesbar text-tekst/80">
              {da.landing.aerligTekst}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Priser: gran-blok med prislapper (REDESIGN §3.1) */}
      <section className="bg-gran text-kalk" aria-label={da.landing.priserTitel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <SektionsMarkoer nr={3} titel={da.landing.priserTitel} paaMoerk />
            <h2 className="mt-4 max-w-2xl font-display text-kaempe font-bold">
              {da.landing.priserGratis}
            </h2>
            <p className="mt-3 text-hoer">{da.landing.priserDerefter}</p>
          </Reveal>
          <ul className="mt-8 flex flex-wrap items-start gap-6">
            {kreditter.pakker.map((pakke, i) => (
              <li key={pakke.id}>
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
                  </Prislap>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA: hør-blok med plakat-typo (REDESIGN §3.1) */}
      <section className="bg-flade">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="max-w-3xl font-display text-kaempe font-bold">
              {da.landing.ctaTitel}
            </h2>
            <Link href="/log-ind" className={`mt-8 ${ctaKlasser}`}>
              {da.landing.ctaKnap}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
