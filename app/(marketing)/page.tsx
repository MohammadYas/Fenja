import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SektionsMarkoer } from "@/components/sektions-markoer";
import { Stempel } from "@/components/ui/stempel";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";

export const metadata = {
  title: `${da.site.navn} — ${da.landing.heroTitel}`,
  description: da.site.beskrivelse,
};

// Landing page (F-1) i v4-retningen "roligt katalog": plakat-typografi og
// farveblokke består, men fladerne er rolige — ingen skygger, rotationer eller
// rekvisitter. Hero-figuren SKAL udskiftes med ægte app-output efter S12
// (Gate 1) — indtil da en ærligt mærket pladsholder, aldrig opstillede
// eksempler (§2.1.7).
export default function Forside() {
  return (
    <main>
      {/* Plakat-hero: overskriften ER hero-grafikken (REDESIGN §2.1) —
          katalog-marginalia lodret i kanten på lg */}
      <section className="relative overflow-x-clip">
        <p
          aria-hidden="true"
          className="absolute right-3 top-12 hidden select-none font-mono text-detalje uppercase tracking-widest text-tekst/40 [writing-mode:vertical-rl] lg:block"
        >
          {da.landing.marginal}
        </p>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:pt-16 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12">
          <div>
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
            <Link href="/log-ind" className="knap-link mt-6">
              {da.landing.heroKnap}
            </Link>
          </div>

          {/* Beviset: før og efter i ét roligt panel, delt af sømmen —
              skillelinjen mellem sjusket seddel og færdig leverance er
              produktets pointe (DESIGN.md §6) */}
          <Reveal>
            <figure className="mt-12 md:mt-16 lg:mt-0">
              <div className="grid overflow-hidden rounded-bloed border border-kant sm:grid-cols-[1fr_auto_1.2fr]">
                {/* Før: den sjuskede annonce */}
                <div className="bg-flade p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
                      {da.landing.foerKort.label}
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-detalje lowercase leading-snug text-tekst/80">
                    {da.landing.foerKort.tekst}
                  </p>
                  <p className="mt-1 font-mono text-detalje lowercase text-tekst/80">
                    {da.landing.foerKort.pris}
                  </p>
                </div>
                {/* Sømmen som skillelinje: vandret på mobil, lodret på sm+ */}
                <div className="soem-vandret sm:hidden" aria-hidden="true" />
                <div className="soem hidden sm:block" aria-hidden="true" />
                {/* Efter: leverancen */}
                <div className="bg-baggrund p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-mono text-detalje font-medium uppercase tracking-wide text-gran">
                      {da.landing.efterKort.label}
                    </span>
                    <Stempel>{da.landing.heroStempel}</Stempel>
                  </div>
                  <p className="mt-3 font-display text-titel font-bold">
                    {da.landing.efterKort.titel}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-detalje text-tekst/80">
                    {da.landing.efterKort.punkter.map((punkt) => (
                      <li key={punkt} className="flex gap-2">
                        <span aria-hidden="true" className="text-rav">
                          —
                        </span>
                        {punkt}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-mono text-detalje font-bold text-pris">
                    {da.landing.efterKort.pris}
                  </p>
                </div>
              </div>
              <figcaption className="mt-3 text-detalje text-tekst/70">
                {da.landing.heroPladsholder}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Sådan virker det: katalog-nummerering i rolig, ensartet rytme */}
      <section aria-label={da.landing.saadanTitel}>
        <div className="mx-auto max-w-5xl px-4 py-14">
          <SektionsMarkoer nr={1} titel={da.landing.saadanTitel} />
          <ol className="mt-8 flex flex-col">
            {da.landing.saadanTrin.map((trin, i) => (
              <li key={trin.titel} className="border-t border-kant py-8">
                <Reveal forsinkelseTrin={i}>
                  <div className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 md:grid-cols-[5rem_1fr]">
                    <span
                      aria-hidden="true"
                      className="select-none font-mono text-hero font-bold leading-none text-rav"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-titel font-semibold">
                        {trin.titel}
                      </h3>
                      <p className="mt-2 max-w-laesbar text-tekst/80">{trin.tekst}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ærligheds-blok: koks — sidens ene mørke, tunge udsagn; indrykket bag
          lodret søm på lg (S21) */}
      <section className="bg-koks text-kalk">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
          <div className="soem hidden lg:block" aria-hidden="true" />
          <Reveal>
            <SektionsMarkoer nr={2} paaMoerk />
            <h2 className="mt-4 font-display text-display font-semibold lg:text-hero">
              {da.landing.aerligTitel}
            </h2>
            <p className="mt-3 max-w-laesbar text-kalk/80 lg:text-lead">
              {da.landing.aerligTekst}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Priser: gran-blok med redaktionelle prisrækker (ingen rekvisitter) */}
      <section className="bg-gran text-kalk" aria-label={da.landing.priserTitel}>
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <SektionsMarkoer nr={3} titel={da.landing.priserTitel} paaMoerk />
            <h2 className="mt-4 max-w-2xl font-display text-kaempe font-bold">
              {da.landing.priserGratis}
            </h2>
            <p className="mt-3 text-hoer">{da.landing.priserDerefter}</p>
          </Reveal>
          <div className="mt-8 max-w-2xl border-t border-kalk/20">
            {kreditter.pakker.map((pakke, i) => (
              <Reveal key={pakke.id} forsinkelseTrin={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-kalk/20 py-5">
                  <p className="font-display text-titel font-semibold">
                    {da.kreditter.pakkeAntal(pakke.antal)}
                  </p>
                  <div className="text-right">
                    <p className="font-mono text-hero font-bold leading-none">
                      {da.kreditter.pakkePris(pakke.prisDkk)}
                    </p>
                    <p className="mt-1 font-mono text-detalje text-hoer">
                      {da.kreditter.prisPrStk(
                        (pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","),
                      )}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: hør-blok med plakat-typo */}
      <section className="bg-flade">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="max-w-3xl font-display text-kaempe font-bold">
              {da.landing.ctaTitel}
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/log-ind" className="knap-link">
                {da.landing.ctaKnap}
              </Link>
              <Stempel>{da.landing.ctaLap}</Stempel>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
