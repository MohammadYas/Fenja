// Garderobe-radar (abonnent-fordel, 21/8): sourcing-intelligens — hvilke
// mærker/kategorier fra markedshøsten er mest værd LIGE NU, vægtet med
// sæsonen. Radaren fortæller en reseller hvad der er værd at støve op i
// genbrugsbutikken i denne måned. Rene funktioner over committede data.

import { MARKEDSPRISER, type Markedsinterval } from "@/lib/data/markedspriser";
import { vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason, hentSaeson, maanedsnavn, naesteHoesason } from "./saeson";

export type RadarPunkt = {
  maerke: string;
  /** Menneskelæsbar kategori fra søgeteksten, fx "kjole" */
  kategori: string;
  medianDkk: number;
  p75Dkk: number;
  antal: number;
  iSaeson: boolean;
  /** "i sæson nu (forår og sommer)" eller "bedst i oktober" */
  saesonTekst: string;
};

export const RADAR_ANTAL = 6;

export function bygRadar(
  nu: Date = new Date(),
  priser: readonly Markedsinterval[] = MARKEDSPRISER,
): RadarPunkt[] {
  const maaned = nu.getMonth() + 1;
  const punkter = priser.map((interval) => {
    const kategori = interval.matchOrd[0] ?? interval.soegetekst;
    const skabelon = vaelgSkabelon(kategori);
    const iSaeson = erHoesason(skabelon.id, maaned);
    const naeste = naesteHoesason(skabelon.id, maaned);
    const saesonTekst = iSaeson
      ? `i sæson nu (${hentSaeson(skabelon.id).navn})`
      : naeste
        ? `bedst i ${maanedsnavn(naeste.maaned)}`
        : "sælger hele året";
    return {
      maerke: interval.maerke,
      kategori,
      medianDkk: interval.medianDkk,
      p75Dkk: interval.p75Dkk,
      antal: interval.antal,
      iSaeson,
      saesonTekst,
    };
  });

  // I sæson først, dernæst højeste median — det er dér gevinsten bor
  return punkter
    .sort((a, b) =>
      a.iSaeson === b.iSaeson
        ? b.medianDkk - a.medianDkk
        : a.iSaeson
          ? -1
          : 1,
    )
    .slice(0, RADAR_ANTAL);
}
