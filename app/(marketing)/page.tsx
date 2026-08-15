import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SektionsMarkoer } from "@/components/sektions-markoer";
import { Prislap } from "@/components/ui/prislap";
import { Toerresnor, ToerresnorLap } from "@/components/toerresnor";
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
      {/* Plakat-hero (v3): overskriften ER hero-grafikken (REDESIGN §2.1) —
          midterlinjen som ren kontur, sidste ord i rav; katalog-marginalia
          lodret i kanten på lg */}
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
              {da.landing.heroPlakatLinjer.map((ord, i) => (
                <span key={ord} className={`block ${i === 1 ? "tekst-kontur" : ""}`}>
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
          </div>

          {/* Beviset (v3): annoncen som transformation — den sjuskede seddel
              overlappet af den færdige leverance. Ingen fotos at fake, intet
              tomt felt (AI-tegn nr. 1) */}
          <Reveal>
            <figure className="relative mt-12 md:mt-16 lg:mt-0">
              <div className="relative pt-4">
                {/* Før: krøllet seddel på hør */}
                <div className="rotate-lap-v relative z-0 max-w-[15rem] rounded-stram border-2 border-koks bg-hoer p-4">
                  <span className="font-mono text-detalje font-bold uppercase tracking-wide text-tekst/60">
                    {da.landing.foerKort.label}
                  </span>
                  <p className="mt-2 font-mono text-detalje lowercase leading-snug text-tekst/80">
                    {da.landing.foerKort.tekst}
                  </p>
                  <p className="mt-1 font-mono text-detalje lowercase text-tekst/80">
                    {da.landing.foerKort.pris}
                  </p>
                  {/* "Utydeligt foto" — det er dét, efter-kortet lægger sig over */}
                  <div
                    className="skravering mt-2 h-16 rounded-stram border border-koks/40"
                    aria-hidden="true"
                  />
                </div>
                {/* Efter: leverancen, lagt hen over — søm i venstre kant */}
                <div className="rotate-lap-h relative z-10 -mt-10 ml-10 flex max-w-xs rounded-bloed border-2 border-koks bg-kalk shadow-offset-gran sm:ml-20">
                  <div className="soem shrink-0" aria-hidden="true" />
                  <div className="p-5">
                    <span className="font-mono text-detalje font-bold uppercase tracking-wide text-gran">
                      {da.landing.efterKort.label}
                    </span>
                    <p className="mt-2 font-display text-titel font-bold">
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
                    <p className="mt-3 inline-block rounded-stram bg-gran px-2 py-1 font-mono text-detalje font-bold text-kalk">
                      {da.landing.efterKort.pris}
                    </p>
                  </div>
                </div>
                <div className="absolute -top-1 right-2">
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

      {/* Ærligheds-blok (v3): koks — sidens ene mørke, tunge udsagn, så
          farvebåndene ikke gentager samme rytme; indrykket bag lodret søm (S21) */}
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
          <div className="mt-8">
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

      {/* CTA: hør-blok med plakat-typo (REDESIGN §3.1) */}
      <section className="bg-flade">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <Reveal>
            <h2 className="max-w-3xl font-display text-kaempe font-bold">
              {da.landing.ctaTitel}
            </h2>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link href="/log-ind" className={ctaKlasser}>
                {da.landing.ctaKnap}
              </Link>
              <Prislap taet rotation="hoejre">
                <span className="font-mono text-detalje font-bold uppercase tracking-wide">
                  {da.landing.ctaLap}
                </span>
              </Prislap>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
