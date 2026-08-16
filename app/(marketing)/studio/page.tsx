import Link from "next/link";
import { Billedserie } from "@/components/billedserie";
import { Reveal } from "@/components/reveal";
import { kontakt } from "@/lib/config";
import { da } from "@/lib/copy/da";

// Selja Studio — B2B-sporet PARKERET som outreach-side (STRATEGISKIFT
// 2026-08-15: forsiden er Vinted-appen alene). Sektionerne er flyttet UÆNDRET
// fra den gamle forside: hero, ydelser, FAQ og "Sådan foregår det".
// Ikke i nav, ikke i sitemap, noindex — kun det diskrete footer-link peger her.
export const metadata = {
  title: `${da.site.navn} Studio — ${da.landing.heroTitel}`,
  description: da.landing.heroTekst,
  robots: { index: false, follow: false },
};

export default function StudioSide() {
  return (
    <main>
      {/* Hero: virksomheds-sporet. Sekundærvejen peger nu på forsiden (appen). */}
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
              <Link
                href="/"
                className="soem-link inline-flex min-h-touch items-center font-medium text-primaer"
              >
                {da.landing.heroSekundaer}
              </Link>
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
    </main>
  );
}
