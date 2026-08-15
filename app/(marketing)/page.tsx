import Image from "next/image";
import Link from "next/link";
import { Billedserie } from "@/components/billedserie";
import { Reveal } from "@/components/reveal";
import { kontakt } from "@/lib/config";
import { da } from "@/lib/copy/da";

export const metadata = {
  title: `${da.site.navn} — ${da.landing.heroTitel}`,
  description: da.site.beskrivelse,
};

// Landing i v6 "Klar & nordisk" (DESIGN.md §5): B2B først (UGC-annoncer,
// annoncebilleder, hjemmesider), appen som egen sektion, ingen priser på
// forsiden. Sektioner adskilles af luft + hairline — én mørk blok (Ærlighed).
export default function Forside() {
  return (
    <main>
      {/* Hero: virksomheds-sporet. Én primær CTA (mailto), appen som stille
          sekundær vej — begge målgrupper finder deres dør over folden. */}
      <section id="virksomheder" className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
          <div className="indgang">
            <h1 className="max-w-3xl font-display text-plakat font-bold">
              {da.landing.heroRubrik}
            </h1>
            <p className="mt-6 max-w-laesbar text-lead text-tekst/80">
              {da.landing.heroTekst}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href={`mailto:${kontakt.email}`} className="knap-link">
                {da.landing.heroKnap}
              </a>
              <a
                href="#appen"
                className="soem-link min-h-touch content-center font-medium text-primaer"
              >
                {da.landing.heroSekundaer}
              </a>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-md lg:mt-0 lg:max-w-none">
            <Billedserie billeder={da.landing.billedserie} prioritet />
          </div>
        </div>
      </section>

      {/* Ydelser: redaktionelle rækker med hairlines — ikke ikon-grid (manifest
          §2.1.5). Nummer i mono, indhold i to spalter på md+. */}
      <section aria-label={da.landing.ydelserTitel} className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {da.landing.ydelserTitel}
          </h2>
          <ol className="mt-6">
            {da.landing.ydelser.map((ydelse, i) => (
              <li key={ydelse.titel} className="border-t border-kant py-7 first:border-t-0">
                <Reveal forsinkelseTrin={i}>
                  <div className="grid gap-2 md:grid-cols-[3rem_16rem_1fr] md:gap-6">
                    <span
                      aria-hidden="true"
                      className="select-none font-mono text-basis text-tekst/50"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-titel font-semibold">{ydelse.titel}</h3>
                    <div>
                      <p className="max-w-laesbar text-tekst/80">{ydelse.tekst}</p>
                      <p className="mt-2 font-mono text-detalje text-tekst/60">
                        {ydelse.leverance}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-laesbar text-tekst/80">{da.landing.ydelserCta}</p>
          <a href={`mailto:${kontakt.email}`} className="knap-link mt-5">
            {da.landing.heroKnap}
          </a>
        </div>
      </section>

      {/* B2B-FAQ: tre ærlige svar — pris, ejerskab, levering */}
      <section aria-label={da.landing.b2bFaqTitel} className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {da.landing.b2bFaqTitel}
          </h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {da.landing.b2bFaq.map((punkt, i) => (
              <Reveal key={punkt.spoergsmaal} forsinkelseTrin={i}>
                <div className="border-t border-kant pt-4">
                  <h3 className="font-display text-lead font-semibold">
                    {punkt.spoergsmaal}
                  </h3>
                  <p className="mt-2 max-w-laesbar text-tekst/80">{punkt.svar}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Appen: Vinted-sporet med before/after-panelet som bevis (signatur-
          elementet, HANDOFF §2.2.3) og de tre trin som rolige rækker. */}
      <section id="appen" className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {da.landing.appenMaerkat}
          </p>
          <div className="mt-4 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-12">
            <div>
              <h2 className="max-w-2xl font-display text-kaempe font-bold">
                {da.landing.appenTitel}
              </h2>
              <p className="mt-4 max-w-laesbar text-tekst/80">{da.landing.appenTekst}</p>
              <Link href="/log-ind" className="knap-link mt-6">
                {da.landing.appenKnap}
              </Link>
            </div>
            <Reveal>
              <figure className="mt-10 lg:mt-0">
                <div className="grid overflow-hidden rounded-bloed border border-kant sm:grid-cols-[1fr_auto_1.2fr]">
                  <div className="bg-flade p-5">
                    <span className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
                      {da.landing.foerKort.label}
                    </span>
                    <p className="mt-3 font-mono text-detalje lowercase leading-snug text-tekst/80">
                      {da.landing.foerKort.tekst}
                    </p>
                    <p className="mt-1 font-mono text-detalje lowercase text-tekst/80">
                      {da.landing.foerKort.pris}
                    </p>
                  </div>
                  <div className="soem-vandret sm:hidden" aria-hidden="true" />
                  <div className="soem hidden sm:block" aria-hidden="true" />
                  <div className="bg-baggrund p-5">
                    <span className="font-mono text-detalje font-medium uppercase tracking-wide text-gran">
                      {da.landing.efterKort.label}
                    </span>
                    <p className="mt-3 font-display text-titel font-bold">
                      {da.landing.efterKort.titel}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1 text-detalje text-tekst/80">
                      {da.landing.efterKort.punkter.map((punkt) => (
                        <li key={punkt} className="flex gap-2">
                          <span aria-hidden="true" className="text-tekst/40">
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

          {/* Visualiserings-stilen som billedpar (ejer-ordre: ingen synlig
              mærkat — midlertidigt; ægte output efter S12/S25, se STATUS) */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-2xl">
            {[da.landing.billedserie[0]!, da.landing.billedserie[3]!].map((billede, i) => (
              <Reveal key={billede.src} forsinkelseTrin={i}>
                <Image
                  src={billede.src}
                  alt={billede.alt}
                  width={900}
                  height={1350}
                  className="w-full rounded-bloed border border-kant object-cover"
                />
              </Reveal>
            ))}
          </div>

          <h3 className="mt-12 font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {da.landing.saadanTitel}
          </h3>
          <ol className="mt-2">
            {da.landing.saadanTrin.map((trin, i) => (
              <li
                key={trin.titel}
                className="border-t border-kant py-6 first:border-t-0 first:pt-4"
              >
                <Reveal forsinkelseTrin={i}>
                  <div className="grid gap-1 md:grid-cols-[3rem_16rem_1fr] md:gap-6">
                    <span
                      aria-hidden="true"
                      className="select-none font-mono text-basis text-tekst/50"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-display text-lead font-semibold">{trin.titel}</h4>
                    <p className="max-w-laesbar text-tekst/80">{trin.tekst}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* B2B-forløbet: sidens ene mørke bånd */}
      <section className="bg-koks text-kalk" aria-label={da.landing.procesTitel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <Reveal>
            <h2 className="font-display text-display font-semibold">
              {da.landing.procesTitel}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {da.landing.procesTrin.map((trin, i) => (
              <Reveal key={trin.titel} forsinkelseTrin={i}>
                <div className="border-t border-kalk/20 pt-4">
                  <span aria-hidden="true" className="font-mono text-detalje text-kalk/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-lead font-semibold">{trin.titel}</h3>
                  <p className="mt-2 text-detalje text-kalk/80">{trin.tekst}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Slut-CTA: begge målgrupper, roligt på kalk */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="max-w-2xl font-display text-kaempe font-bold">
              {da.landing.ctaTitel}
            </h2>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-4">
              <a href={`mailto:${kontakt.email}`} className="knap-link">
                {da.landing.ctaVirksomhedKnap}
              </a>
              <Link
                href="/log-ind"
                className="soem-link min-h-touch content-center font-medium text-primaer"
              >
                {da.landing.ctaAppKnap}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
