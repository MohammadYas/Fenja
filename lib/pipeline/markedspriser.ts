// M2/D-4: slå items mærke + kategori op i den committede markedsstatistik
// (lib/data/markedspriser.ts, genereret af markedsanalyse-scriptsene), så
// prisforslaget kan virkelighedstjekkes mod faktiske udbudspriser.

import { MARKEDSPRISER, type Markedsinterval } from "@/lib/data/markedspriser";

/** "Levi's" → "levis", "H&M" → "hm" — så fritekst-mærker matcher robust */
function normaliserMaerke(tekst: string): string {
  return tekst.toLowerCase().replace(/[^a-z0-9æøå]/g, "");
}

function normaliser(tekst: string): string {
  return tekst.toLowerCase().trim();
}

/**
 * Finder det bedst dækkede markedsinterval for et item, eller null.
 * Mærket skal matche (normaliseret), og mindst ét matchOrd skal indgå i
 * kategorien. Ved flere kandidater vinder den med flest annoncer bag.
 */
export function findMarkedsinterval(
  maerke: string,
  kategori: string,
  priser: readonly Markedsinterval[] = MARKEDSPRISER,
): Markedsinterval | null {
  const m = normaliserMaerke(maerke);
  const k = normaliser(kategori);
  if (m === "" || k === "") return null;

  let bedste: Markedsinterval | null = null;
  for (const interval of priser) {
    if (normaliserMaerke(interval.maerke) !== m) continue;
    if (!interval.matchOrd.some((ord) => k.includes(normaliser(ord)))) continue;
    if (!bedste || interval.antal > bedste.antal) bedste = interval;
  }
  return bedste;
}
