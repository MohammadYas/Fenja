import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { FoerEfter } from "@/components/vinted/foer-efter";
import { da } from "@/lib/copy/da";
import { vinted } from "@/lib/copy/vinted";
import { hentGuides } from "@/lib/guides";

// Selvstændig landing for Vinted-appen (additiv-opgaven 2026-08-15).
// Metadata defineres HER, ikke i delte filer. Billeder: serie v2 uden synlig
// mærkat (ejer-ordre samme dag — overstyrer opgavetekstens "eksisterende
// mærkat", som ikke findes længere; se STATUS).
export const metadata = {
  title: vinted.meta.titel,
  description: vinted.meta.beskrivelse,
  openGraph: {
    title: vinted.meta.titel,
    description: vinted.meta.beskrivelse,
    locale: "da_DK",
    type: "website",
  },
};

export default function VintedSide() {
  const guides = hentGuides().slice(0, 3);

  return (
    <main>
      {/* Hero: before/after-panelet er omdrejningspunktet */}
      <section className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14">
          <div className="indgang">
            <p className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
              {vinted.hero.maerkat}
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-plakat font-bold">
              {vinted.hero.rubrik}
            </h1>
            <p className="mt-6 max-w-laesbar text-lead text-tekst/80">
              {vinted.hero.tekst}
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

      {/* Visualiserings-eksempler: billedpar fra serie v2 */}
      <section className="border-b border-kant" aria-label={da.landing.appenMaerkat}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid grid-cols-2 gap-4 sm:max-w-2xl">
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
        </div>
      </section>

      {/* Sådan virker det: 3 trin som rolige rækker */}
      <section className="border-b border-kant" aria-label={vinted.saadan.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {vinted.saadan.titel}
          </h2>
          <ol className="mt-2">
            {vinted.saadan.trin.map((trin, i) => (
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
                    <h3 className="font-display text-lead font-semibold">{trin.titel}</h3>
                    <p className="max-w-laesbar text-tekst/80">{trin.tekst}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ærlighed som fordel — sidens ene mørke bånd */}
      <section className="bg-koks text-kalk" aria-label={vinted.aerlighed.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <Reveal>
            <h2 className="font-display text-display font-semibold">
              {vinted.aerlighed.titel}
            </h2>
          </Reveal>
          <ul className="mt-6 flex max-w-2xl flex-col gap-4">
            {vinted.aerlighed.punkter.map((punkt, i) => (
              <Reveal key={punkt} forsinkelseTrin={i}>
                <li className="flex gap-3 text-kalk/85">
                  <span aria-hidden="true" className="text-kalk/50">
                    —
                  </span>
                  {punkt}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Lær-teaser: tre guides + vej til dem alle */}
      <section className="border-b border-kant" aria-label={vinted.laerTeaser.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="font-display text-kaempe font-bold">{vinted.laerTeaser.titel}</h2>
          <p className="mt-3 max-w-laesbar text-tekst/80">{vinted.laerTeaser.tekst}</p>
          <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-3">
            {guides.map((guide, i) => (
              <Reveal key={guide.slug} forsinkelseTrin={i}>
                <Link href={`/laer/${guide.slug}`} className="group block border-t border-kant pt-4">
                  <span className="font-mono text-detalje text-tekst/50">
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
            <Link href="/laer" className="soem-link min-h-touch content-center font-medium text-primaer">
              {vinted.laerTeaser.alleGuides} →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA + diskret vej til B2B-sporet */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="max-w-2xl font-display text-kaempe font-bold">
              {vinted.cta.titel}
            </h2>
            <Link href="/log-ind" className="knap-link mt-7">
              {vinted.cta.knap}
            </Link>
          </Reveal>
          <p className="mt-12 text-detalje text-tekst/70">
            {vinted.studioLinje.tekst}{" "}
            <Link href="/" className="soem-link font-medium text-primaer">
              {vinted.studioLinje.link} →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
