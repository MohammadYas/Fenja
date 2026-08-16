import Image from "next/image";
import Link from "next/link";
import { FoerEfter } from "@/components/foer-efter";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { da } from "@/lib/copy/da";
import { vinted } from "@/lib/copy/vinted";
import { hentGuides } from "@/lib/guides";
import { forsideGraf } from "@/lib/seo/jsonld";

// Forsiden er Vinted-appen (STRATEGISKIFT 2026-08-15: Selja er ét produkt
// udadtil — B2B-studioet er parkeret på /studio, kun linket fra footeren).
// Indholdet er /vinted-landingen fra feat/vinted-side; /vinted redirecter hertil.
export const metadata = {
  title: vinted.meta.titel,
  description: vinted.meta.beskrivelse,
  alternates: { canonical: "/" },
  openGraph: {
    title: vinted.meta.titel,
    description: vinted.meta.beskrivelse,
    locale: "da_DK",
    type: "website",
  },
};

export default function Forside() {
  const guides = hentGuides().slice(0, 3);

  return (
    <main>
      {/* Produkt (web-app + priser) og trin-for-trin how-to til rich results/LLM */}
      <JsonLd data={forsideGraf()} />
      {/* Hero: before/after-panelet er omdrejningspunktet (signatur-elementet,
          HANDOFF §2.2.3) */}
      <section className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
          <div className="indgang">
            <h1 className="max-w-2xl font-display text-plakat font-bold">
              {vinted.hero.rubrik}
            </h1>
            <p className="mt-6 max-w-laesbar text-lead text-tekst/80">
              {vinted.hero.tekst}
            </p>
            <p className="mt-4 max-w-laesbar text-detalje text-tekst/70">
              {vinted.hero.tidsnote}
            </p>
            <Link href="/log-ind" className="knap-link mt-8">
              {vinted.hero.knap}
            </Link>
          </div>
          <div className="mt-12 lg:mt-0">
            <Reveal>
              <FoerEfter />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Fire billeder fra serien med produktkontekst. Mærkning tilføjes først
          i ejerens særskilte udgivelsesrunde (se STATUS). */}
      <section className="border-b border-kant" aria-labelledby="billedserie-titel">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2
            id="billedserie-titel"
            className="font-display text-display font-bold"
          >
            {vinted.billedserie.titel}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {da.landing.billedserie.slice(0, 4).map((billede, i) => (
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
        </div>
      </section>

      {/* Sådan virker det: 3 trin som rolige rækker — nav-ankeret peger her */}
      <section id="saadan" className="border-b border-kant" aria-label={vinted.saadan.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-display text-display font-bold">
            {vinted.saadan.titel}
          </h2>
          <ol className="mt-6">
            {vinted.saadan.trin.map((trin, i) => (
              <li
                key={trin.titel}
                className="border-t border-kant py-6 first:border-t-0 first:pt-4"
              >
                <Reveal forsinkelseTrin={i}>
                  <div className="grid gap-1 md:grid-cols-[3rem_16rem_1fr] md:gap-6">
                    <span
                      aria-hidden="true"
                      className="select-none font-mono text-basis text-tekst/70"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-lead font-semibold">{trin.titel}</h3>
                    <p className="max-w-laesbar text-tekst/80">{trin.tekst}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Praktisk Vinted-brug i sidens ene mørke bånd. */}
      <section
        className="bg-koks text-kalk"
        aria-labelledby="vinted-brug-titel"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <Reveal>
            <h2 id="vinted-brug-titel" className="font-display text-display font-bold">
              {vinted.brugPaaVinted.titel}
            </h2>
          </Reveal>
          <ul className="mt-6 flex max-w-2xl flex-col gap-4">
            {vinted.brugPaaVinted.punkter.map((punkt, i) => (
              <li key={punkt}>
                <Reveal forsinkelseTrin={i}>
                  <div className="flex gap-3 text-kalk/85">
                    <span aria-hidden="true" className="font-mono text-detalje text-hoer">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {punkt}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lær-teaser: tre guides + vej til dem alle */}
      <section className="border-b border-kant" aria-labelledby="laer-titel">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 id="laer-titel" className="font-display text-display font-bold">
            {vinted.laerTeaser.titel}
          </h2>
          <p className="mt-3 max-w-laesbar text-tekst/80">{vinted.laerTeaser.tekst}</p>
          <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-3">
            {guides.map((guide, i) => (
              <Reveal key={guide.slug} forsinkelseTrin={i}>
                <Link href={`/laer/${guide.slug}`} className="group block border-t border-kant pt-4">
                  <span aria-hidden="true" className="select-none font-mono text-detalje text-tekst/70">
                    {String(guide.raekkefoelge).padStart(2, "0")}
                  </span>
                  <span className="soem-link mt-1 block font-display text-lead font-semibold group-hover:text-gran">
                    {guide.titel}
                  </span>
                  <span className="mt-2 block text-detalje text-tekst/70">
                    {guide.beskrivelse}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-8">
            <Link href="/laer" className="soem-link inline-flex min-h-touch items-center font-medium text-primaer">
              {vinted.laerTeaser.alleGuides} →
            </Link>
          </p>
        </div>
      </section>

      {/* Slut-CTA: taler kun til sælgere — vejen til studioet bor i footeren */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="max-w-2xl font-display text-kaempe font-bold">
              {vinted.cta.titel}
            </h2>
            <p className="mt-4 max-w-laesbar text-tekst/80">
              {vinted.cta.kreditNote}
            </p>
            <Link href="/log-ind" className="knap-link mt-7">
              {vinted.cta.knap}
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
