"use client";

import Image from "next/image";
import { useState } from "react";
import { vinted } from "@/lib/copy/vinted";

// Before/after-panelet — signatur-elementet (DESIGN.md). Ejer-ordrer 19-20/8:
// panelet viser RIGTIGE billeder fra katalogserien og har nu en vælger med
// flere eksempler (samme stykke tøj i FØR og EFTER: dårligt aftenfoto →
// spejlselfie i dagslys). Alle billeder er AI-genererede visualiseringer
// (provenance: docs/katalog-prompts.md).
export function FoerEfter() {
  const copy = vinted.foerEfter;
  const [valgtId, setValgtId] = useState<string>(copy.par[0]!.id);
  const par = copy.par.find((p) => p.id === valgtId) ?? copy.par[0]!;

  return (
    <figure>
      <div
        role="radiogroup"
        aria-label={copy.vaelgerLabel}
        className="mb-3 flex flex-wrap gap-2"
      >
        {copy.par.map((p) => {
          const aktiv = p.id === valgtId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={aktiv}
              onClick={() => setValgtId(p.id)}
              className={`min-h-touch rounded-bloed border px-3 py-1.5 text-detalje transition-colors duration-150 ease-out focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks ${
                aktiv
                  ? "border-gran bg-gran text-kalk"
                  : "border-kant bg-baggrund text-tekst/80 hover:border-koks/40"
              }`}
            >
              {p.navn}
            </button>
          );
        })}
      </div>

      {/* key-skiftet lader panelet rulle ind ved skift (pris-rul).
          Ejer-ordre 22/8 (præciseret: KUN på telefon): i den stablede
          mobil-visning står EFTER øverst — tøjet båret er det, man skal se
          først — mens desktop beholder FØR til venstre og EFTER til højre.
          Derfor: EFTER først i DOM'en (mobil-rækkefølgen), og fra sm: sættes
          panelerne på plads med eksplicitte grid-kolonner. */}
      <div
        key={par.id}
        className="pris-rul grid overflow-hidden rounded-bloed border border-kant sm:grid-cols-[1fr_auto_1.2fr]"
      >
        <div className="bg-baggrund p-5 sm:col-start-3 sm:row-start-1">
          <span className="font-mono text-detalje font-medium uppercase tracking-wide text-gran">
            {copy.efterLabel}
          </span>
          <Image
            src={par.efterBillede}
            alt={par.efterAlt}
            width={900}
            height={1350}
            sizes="(min-width: 640px) 280px, 80vw"
            className="mt-3 w-full rounded-bloed border border-kant"
            priority
          />
          <p className="mt-3 font-display text-titel font-bold">{par.efterTitel}</p>
          <ul className="mt-2 flex flex-col gap-1 text-detalje text-tekst/80">
            {copy.punkter.map((punkt) => (
              <li key={punkt} className="flex gap-2">
                <span aria-hidden="true" className="text-tekst/40">
                  —
                </span>
                {punkt}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-detalje font-bold text-pris">
            {par.efterPris}
          </p>
          {/* Pris-gevinsten gjort synlig (konverterings-plan 20/8) — vores
              egne eksempeltal, FØR-prisen står lige ved siden af */}
          <p className="mt-1 font-mono text-detalje text-ravDyb">
            {par.foerPris} → {par.efterPris.replace("Prisforslag: ", "")}
          </p>
        </div>
        <div className="soem-vandret sm:hidden" aria-hidden="true" />
        <div className="soem hidden sm:col-start-2 sm:row-start-1 sm:block" aria-hidden="true" />
        <div className="bg-flade p-5 sm:col-start-1 sm:row-start-1">
          <span className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/70">
            {copy.foerLabel}
          </span>
          <Image
            src={par.foerBillede}
            alt={par.foerAlt}
            width={900}
            height={1350}
            sizes="(min-width: 640px) 240px, 80vw"
            className="mt-3 w-full rounded-bloed border border-kant"
            priority
          />
          <p className="mt-3 font-mono text-detalje lowercase leading-snug text-tekst/80">
            {par.foerTekst}
          </p>
          <p className="mt-1 font-mono text-detalje lowercase text-tekst/80">
            {par.foerPris}
          </p>
        </div>
      </div>
      {/* Sleek AI-mærkning (MANGLER §4/art. 50): stille linje, ingen badge */}
      <figcaption className="mt-2 text-detalje text-tekst/60">
        {copy.maerkat}
      </figcaption>
    </figure>
  );
}
