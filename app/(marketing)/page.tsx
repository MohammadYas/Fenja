import Link from "next/link";
import { Anmeldelser } from "@/components/anmeldelser";
import { BilledSlides } from "@/components/billed-slides";
import { Billedstroem } from "@/components/billedstroem";
import { FoerEfter } from "@/components/foer-efter";
import { SkabRegner } from "@/components/skab-regner";
import { StickyCta } from "@/components/sticky-cta";
import { abonnementer } from "@/lib/config";
import { hentPopulaere, nyesteHoestDato } from "@/lib/eksperimenter";
import { hentAlleKatalogBilleder, hentAlleKatalogRaekker } from "@/lib/katalog-server";

// Konservativ midterpris til drømme-regnestykket: medianen af høstens
// medianpriser, rundet ned til nærmeste 25 kr. (regneeksempel, aldrig løfte)
function typiskMedianDkk(): number {
  const medianer = hentPopulaere(100)
    .map((m) => m.medianDkk)
    .sort((a, b) => a - b);
  if (medianer.length === 0) return 100;
  const midt = medianer[Math.floor(medianer.length / 2)]!;
  return Math.max(25, Math.floor(midt / 25) * 25);
}
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { vinted } from "@/lib/copy/vinted";
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
    // Sidens openGraph ERSTATTER layoutets (Next merger pr. toplevel-nøgle),
    // så delebilledet skal også med her
    images: [
      {
        url: "/og-billede.jpg",
        width: 1200,
        height: 630,
        alt: "Før og efter: sjusket aftenfoto af en cardigan, og samme cardigan vist båret på et billede genereret med Selja",
      },
    ],
  },
};

// Revalidér hvert 5. minut: ejer-uploadede forside-billeder (admin-panelet)
// dukker op uden deploy
export const revalidate = 300;

export default async function Forside() {
  const hoestDato = nyesteHoestDato();
  const regneMedian = typiskMedianDkk();
  // Katalogbillederne findes automatisk fra public/eksempler/katalog/ —
  // nye filer kommer med i både slides og strøm uden kodeændring (ejer-ordre)
  const katalogBilleder = await hentAlleKatalogBilleder();
  const katalogRaekker = await hentAlleKatalogRaekker();

  return (
    <main>
      {/* Produkt (web-app + priser) og trin-for-trin how-to til rich results/LLM */}
      <JsonLd data={forsideGraf()} />
      {/* Hero: before/after-panelet er omdrejningspunktet (signatur-elementet,
          HANDOFF §2.2.3) */}
      <section className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 lg:grid lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-x-14">
          <div className="indgang">
            <h1 className="max-w-2xl font-display text-plakat font-bold">
              {vinted.hero.rubrik}
            </h1>
            <p className="mt-6 max-w-laesbar text-lead text-tekst/80">
              {vinted.hero.tekst}
            </p>
            {/* Ejer-ordre 25/8 aften: gratis prøven er hovedknappen — den
                laveste tærskel (ingen konto) skal være den tydeligste vej */}
            <Link href="/prov" className="knap-link mt-8">
              {vinted.hero.knap}
            </Link>
            {/* Friktionsdræber (konverterings-plan 20/8) */}
            <p className="mt-2 text-detalje text-tekst/60">
              {vinted.hero.friktion}
            </p>
            <p className="mt-4 text-detalje">
              <Link href="/log-ind" className="soem-link text-primaer">
                {vinted.hero.loginLink}
              </Link>
            </p>
          </div>
          <div className="mt-12 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mt-0">
            <Reveal>
              <FoerEfter />
            </Reveal>
          </div>
          {/* Anmeldelserne bor på desktop i venstre kolonne under teksten, så
              heroen balancerer (ejer-ordre 2026-08-20) — men på telefon UNDER
              før/efter-eksemplet (ejer-ordre 22/8: eksemplet først), derfor
              egen grid-celle i stedet for at bo inde i tekstkolonnen */}
          <div className="mt-10 lg:col-start-1 lg:row-start-2">
            <Anmeldelser />
          </div>
        </div>
      </section>

      {/* Sådan virker det STÅR FØRST efter heroen (oprydning 21/8, ejer:
          "forsiden er rodet for en ny bruger") — det første en ny besøgende
          skal forstå er hvad produktet gør, ikke et regnestykke */}
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

      {/* Drømme-regnestykket (ejer-godkendt konverterings-plan 20/8):
          skabets mulige værdi på ægte høst-medianer, mærket regneeksempel */}
      {hoestDato ? (
        <section className="border-b border-kant" aria-label={vinted.skabRegner.titel}>
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <SkabRegner
              medianDkk={regneMedian}
              hoestDato={new Date(hoestDato).toLocaleDateString("da-DK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </section>
      ) : null}

      {/* "Tøjet vist båret" som slides (ejer-ordre 2026-08-20): ALLE
          katalogbilleder kører rundt automatisk — også nye filer. Mærkning
          tilføjes først i ejerens særskilte udgivelsesrunde (STATUS). */}
      <section className="border-b border-kant" aria-labelledby="billedserie-titel">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2
            id="billedserie-titel"
            className="font-display text-display font-bold"
          >
            {vinted.billedserie.titel}
          </h2>
          <p className="mt-2 text-detalje text-tekst/70">
            {vinted.billedserie.note}
          </p>
          <BilledSlides billeder={katalogBilleder} />
          {/* Mellem-CTA (konverterings-plan 20/8) */}
          <p className="mt-6">
            <Link
              href="/prov"
              className="soem-link inline-flex min-h-touch items-center font-medium text-primaer"
            >
              {vinted.mellemCta} →
            </Link>
          </p>
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

      {/* Ærligheds-blokken genplaceret (MANGLER §4): rolig stribe efter det
          mørke bånd — forklarer billede 1-reglen og mærkningen */}
      <section className="border-b border-kant" aria-label={vinted.aerlighed.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="font-display text-titel font-bold">
              {vinted.aerlighed.titel}
            </h2>
            <p className="mt-3 max-w-laesbar text-tekst/80">
              {vinted.aerlighed.tekst}
            </p>
          </Reveal>
        </div>
      </section>



      {/* Pris-transparens (konvertering 22/8): pris-spørgsmålet besvares på
          forsiden FØR signup-væggen — tallene kommer direkte fra config */}
      <section className="border-b border-kant" aria-label={vinted.pris.titel}>
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="font-display text-display font-bold">
              {vinted.pris.titel}
            </h2>
            <p className="mt-3 max-w-laesbar text-tekst/80">
              {vinted.pris.linje(
                abonnementer.tiers[0].annoncerPrMd,
                abonnementer.tiers[0].prisDkkPrMd,
                abonnementer.tiers[1].annoncerPrMd,
                abonnementer.tiers[1].prisDkkPrMd,
              )}
            </p>
            <Link
              href="/priser"
              className="soem-link mt-4 inline-flex min-h-touch items-center font-medium"
            >
              {vinted.pris.knap} →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Slut-CTA: taler kun til sælgere — vejen til studioet bor i footeren */}
      <section className="border-b border-kant">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <Reveal>
            <h2 className="max-w-2xl font-display text-kaempe font-bold">
              {vinted.cta.titel}
            </h2>
            <p className="mt-4 max-w-laesbar text-tekst/80">
              {vinted.cta.kreditNote}
            </p>
            <Link href="/prov" className="knap-link mt-7">
              {vinted.cta.knap}
            </Link>
            <p className="mt-2 text-detalje text-tekst/60">
              {vinted.hero.friktion}
            </p>
            <p className="mt-3 text-detalje">
              <Link href="/log-ind" className="soem-link text-primaer">
                {vinted.cta.loginLink}
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Sticky mobil-CTA (konverterings-plan 20/8) */}
      <StickyCta />

      {/* Annonce-strømmen i bunden (ejer-ordre 2026-08-20: billederne skal
          køre i bunden, så hele serien kan ses): to modsat drivende rækker,
          pause på hover, statisk scrollbar uden JS/med reduceret bevægelse. */}
      <section aria-label={vinted.billedserie.titel}>
        <div className="py-14 md:py-16">
          <Billedstroem raekker={katalogRaekker} />
          {/* Sleek AI-mærkning af strømmen (MANGLER §4/art. 50) */}
          <p className="mt-4 px-4 text-center text-detalje text-tekst/60">
            {vinted.billedserie.note}
          </p>
        </div>
      </section>
    </main>
  );
}
