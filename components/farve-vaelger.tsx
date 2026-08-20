"use client";

import { useState } from "react";
import { da } from "@/lib/copy/da";
import { VINTED_FARVER } from "@/lib/data/vinted-kriterier";

// Farvevalg (ejer-ordre 2026-08-20): ingen dropdown — den native liste åbnede
// malplaceret og fyldte skærmen. Inline chips med farveprik i stedet; op til
// 2 farver kan vælges (som på Vinted). De første 12 vises altid, resten bag
// en "Vis alle"-fold.
const ALTID_VISTE = 12;
const MAKS_VALGTE = 2;

export function FarveVaelger({
  valgte,
  onChange,
}: {
  valgte: string[];
  onChange: (farver: string[]) => void;
}) {
  const [visAlle, setVisAlle] = useState(false);

  // Valgte farver uden for folden holdes synlige, så valget aldrig gemmes væk
  const synlige = VINTED_FARVER.filter(
    (f, i) => visAlle || i < ALTID_VISTE || valgte.includes(f.navn),
  );

  const skift = (navn: string) => {
    if (valgte.includes(navn)) {
      onChange(valgte.filter((v) => v !== navn));
    } else if (valgte.length < MAKS_VALGTE) {
      onChange([...valgte, navn]);
    }
  };

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-basis font-medium text-tekst">
        {da.nytItem.farveLabel}
      </legend>
      <p className="text-detalje text-tekst/70">{da.nytItem.farveHjaelp}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {synlige.map((farve) => {
          const aktiv = valgte.includes(farve.navn);
          const laast = !aktiv && valgte.length >= MAKS_VALGTE;
          return (
            <button
              key={farve.navn}
              type="button"
              aria-pressed={aktiv}
              disabled={laast}
              onClick={() => skift(farve.navn)}
              className={`inline-flex min-h-touch items-center gap-2 rounded-bloed border px-3 py-1.5 text-detalje transition-colors duration-150 ease-out ${
                aktiv
                  ? "border-gran bg-gran text-kalk"
                  : "border-kant bg-baggrund text-tekst/80 hover:border-koks/40"
              } ${laast ? "opacity-40" : ""}`}
            >
              {farve.hex ? (
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full border border-koks/20"
                  style={{ backgroundColor: farve.hex }}
                />
              ) : null}
              {farve.navn}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setVisAlle((v) => !v)}
          className="min-h-touch text-detalje font-medium text-primaer underline underline-offset-4"
        >
          {visAlle ? da.nytItem.farveVisFaerre : da.nytItem.farveVisAlle}
        </button>
      </div>
    </fieldset>
  );
}
