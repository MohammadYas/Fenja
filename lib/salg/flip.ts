// Flip-beregner (KUN Pro, 22/8): radarens storebror. Radaren siger HVAD der
// er værd at source — flip-beregneren siger hvad du højst må GIVE for det i
// genbrugsbutikken, og hvad gevinsten så cirka bliver. Regnet baglæns fra
// markedets median: indkøbsloftet er en fast andel af medianen, så der er
// margen til porto, liggetid og prisforhandling. Rene funktioner over den
// committede markedshøst — ærlige tal, ingen garantier.

import { MARKEDSPRISER, type Markedsinterval } from "@/lib/data/markedspriser";
import { vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason, hentSaeson, maanedsnavn, naesteHoesason } from "./saeson";

export type FlipPunkt = {
  maerke: string;
  kategori: string;
  medianDkk: number;
  /** Højeste fornuftige indkøbspris i genbrug (rundet ned til nærmeste 5 kr.) */
  maksKoebDkk: number;
  /** Forventet gevinst ved salg til medianen: median − maks indkøb */
  gevinstDkk: number;
  antal: number;
  iSaeson: boolean;
  saesonTekst: string;
};

export const FLIP_ANTAL = 6;
// Indkøbsloft som andel af medianen — resten er margen til porto/tid/forhandling
export const MAKS_KOEBSANDEL = 0.4;

export function bygFlipBeregner(
  nu: Date = new Date(),
  priser: readonly Markedsinterval[] = MARKEDSPRISER,
): FlipPunkt[] {
  const maaned = nu.getMonth() + 1;
  const punkter: FlipPunkt[] = [];

  for (const interval of priser) {
    const kategori = interval.matchOrd[0] ?? interval.soegetekst;
    const maksKoebDkk = Math.floor((interval.medianDkk * MAKS_KOEBSANDEL) / 5) * 5;
    if (maksKoebDkk <= 0) continue;
    const skabelon = vaelgSkabelon(kategori);
    const iSaeson = erHoesason(skabelon.id, maaned);
    const naeste = naesteHoesason(skabelon.id, maaned);
    punkter.push({
      maerke: interval.maerke,
      kategori,
      medianDkk: interval.medianDkk,
      maksKoebDkk,
      gevinstDkk: interval.medianDkk - maksKoebDkk,
      antal: interval.antal,
      iSaeson,
      saesonTekst: iSaeson
        ? `i sæson nu (${hentSaeson(skabelon.id).navn})`
        : naeste
          ? `bedst i ${maanedsnavn(naeste.maaned)}`
          : "sælger hele året",
    });
  }

  // I sæson først, dernæst størst gevinst — det er dér flippet betaler sig
  return punkter
    .sort((a, b) =>
      a.iSaeson === b.iSaeson
        ? b.gevinstDkk - a.gevinstDkk
        : a.iSaeson
          ? -1
          : 1,
    )
    .slice(0, FLIP_ANTAL);
}
