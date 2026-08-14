import Link from "next/link";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";

export const metadata = {
  title: `${da.site.navn} — ${da.landing.heroTitel}`,
  description: da.site.beskrivelse,
};

// Landing page (F-1) efter DESIGN.md: before/after med Sømmen som hero.
// Hero-billederne SKAL udskiftes med ægte app-output efter S12 (Gate 1) —
// indtil da viser vi en ærligt mærket pladsholder, aldrig opstillede eksempler (§2.1.7).
export default function Forside() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <h1 className="max-w-2xl font-display text-hero md:text-mega">
          {da.landing.heroTitel}
        </h1>
        <p className="mt-4 max-w-laesbar text-lead text-tekst/80">
          {da.landing.heroTekst}
        </p>
        <Link
          href="/log-ind"
          className="mt-6 inline-flex min-h-touch items-center rounded-bloed bg-primaer px-6 font-medium text-primaer-tekst"
        >
          {da.landing.heroKnap}
        </Link>

        {/* Signatur-elementet: before/after adskilt af Sømmen (DESIGN.md §6) */}
        <figure className="mt-10">
          <div className="flex overflow-hidden rounded-bloed border border-kant">
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
          <figcaption className="mt-2 text-detalje text-tekst/70">
            {da.landing.heroPladsholder}
          </figcaption>
        </figure>
      </section>

      <div className="soem-vandret mx-auto max-w-5xl" aria-hidden="true" />

      <section className="mx-auto max-w-5xl px-4 py-12" aria-label={da.landing.saadanTitel}>
        <h2 className="font-display text-display">{da.landing.saadanTitel}</h2>
        <ol className="mt-6 flex flex-col gap-6 md:flex-row md:gap-10">
          {da.landing.saadanTrin.map((trin, i) => (
            <li key={trin.titel} className="max-w-laesbar flex-1">
              <span className="font-mono text-detalje text-pris">{i + 1}</span>
              <h3 className="mt-1 text-titel font-medium">{trin.titel}</h3>
              <p className="mt-1 text-tekst/80">{trin.tekst}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-flade">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="font-display text-display">{da.landing.aerligTitel}</h2>
          <p className="mt-3 max-w-laesbar text-tekst/80">{da.landing.aerligTekst}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12" aria-label={da.landing.priserTitel}>
        <h2 className="font-display text-display">{da.landing.priserTitel}</h2>
        <p className="mt-3">{da.landing.priserGratis}</p>
        <p className="mt-1 text-tekst/80">{da.landing.priserDerefter}</p>
        <ul className="mt-2 flex flex-col gap-1 font-mono">
          {kreditter.pakker.map((pakke) => (
            <li key={pakke.id}>{da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="soem-vandret" aria-hidden="true" />
        <h2 className="mt-10 max-w-2xl font-display text-display">
          {da.landing.ctaTitel}
        </h2>
        <Link
          href="/log-ind"
          className="mt-5 inline-flex min-h-touch items-center rounded-bloed bg-primaer px-6 font-medium text-primaer-tekst"
        >
          {da.landing.ctaKnap}
        </Link>
      </section>
    </main>
  );
}
