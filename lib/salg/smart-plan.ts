// Smart Salgsplan (ejer-ordre 20/8): den ekstraordinære abonnent-fordel.
// Regner brugerens konkrete næste skridt ud fra tre kilder, der ALLE allerede
// findes i produktet — brugerens annoncer, sæson-tabellen og den committede
// markedshøst. En travl sælger vil aldrig selv lave den beregning; her er den
// automatisk og altid frisk.
//
// Reglerne (bevidst enkle, så rådene altid kan forklares):
//   1) Aktiv annonce der har ligget ≥ 14 dage og ligger OVER markedets median
//      → "Sæt prisen ned" med et konkret tal fra høsten.
//   2) Aktiv annonce i højsæson for sin kategori → "Sælg nu".
//   3) Aktiv annonce med sæsonen 1-2 måneder væk → "Klargør".
//   4) Resten → "Vent" med den bedste måned.
//   5) Kladder (ikke "på vej") tæt på sæsonen → "Klargør".
// Kun rene funktioner — fuldt testbare uden providers eller database.

import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";
import { vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason, hentSaeson, maanedsnavn, naesteHoesason } from "./saeson";

export type PlanInputItem = {
  id: string;
  titel: string;
  maerke: string;
  kategori: string;
  status: "draft" | "active" | "sold";
  leveretAt: string | null;
  prisTilDkk: number | null;
  /** Kladde med kørende pipeline — den skal IKKE rådgives endnu */
  paaVej?: boolean;
};

export type SalgsHandling = "saelgNu" | "saetNed" | "klarGoer" | "vent";

export type SalgsPunkt = {
  itemId: string;
  titel: string;
  handling: SalgsHandling;
  /** Det konkrete råd — en færdig sætning, klar til at følge */
  tekst: string;
  /** Foreslået ny pris i kr. (kun ved "saelgNu"/"saetNed" hvor et tal kendes) */
  foreslaaetPrisDkk?: number;
};

export const SAET_NED_EFTER_DAGE = 14;
export const MAKS_PUNKTER = 6;

const PRIORITET: Record<SalgsHandling, number> = {
  saelgNu: 0,
  saetNed: 1,
  klarGoer: 2,
  vent: 3,
};

function dageSiden(iso: string, nu: Date): number {
  return Math.floor((nu.getTime() - new Date(iso).getTime()) / 86_400_000);
}

function klargoerTekst(kategori: string, maanederTil: number | null, maaned: number | null): string {
  const k = kategori.toLowerCase();
  if (maanederTil === 0 || maanederTil === null) {
    return `Det er sæson for ${k} — gør annoncen klar og læg den op i denne uge.`;
  }
  const tid = maanederTil === 1 ? "1 måned" : `${maanederTil} måneder`;
  return `Sæsonen for ${k} begynder om ${tid} (${maanedsnavn(maaned ?? 1)}) — tag friske billeder og læg den op, når den starter.`;
}

export function bygSalgsplan(
  items: readonly PlanInputItem[],
  nu: Date = new Date(),
): SalgsPunkt[] {
  const maaned = nu.getMonth() + 1;
  const punkter: SalgsPunkt[] = [];

  for (const item of items) {
    if (item.status === "sold" || item.paaVej) continue;
    const skabelon = vaelgSkabelon(item.kategori);
    const kategori = item.kategori.trim() || skabelon.navn;
    const interval = findMarkedsinterval(item.maerke, item.kategori);

    if (item.status === "active" && item.leveretAt) {
      const liggetid = dageSiden(item.leveretAt, nu);

      // Pris-rådet vinder over sæsonen: det flytter penge her og nu
      if (
        liggetid >= SAET_NED_EFTER_DAGE &&
        item.prisTilDkk != null &&
        interval &&
        item.prisTilDkk > interval.medianDkk
      ) {
        const foreslaaet =
          item.prisTilDkk > interval.p75Dkk ? interval.p75Dkk : interval.medianDkk;
        punkter.push({
          itemId: item.id,
          titel: item.titel,
          handling: "saetNed",
          tekst: `Har ligget ${liggetid} dage. Lignende ${kategori.toLowerCase()} sælges typisk for ${interval.p25Dkk}–${interval.p75Dkk} kr. — prøv at sætte ned til ${foreslaaet} kr.`,
          foreslaaetPrisDkk: foreslaaet,
        });
        continue;
      }

      if (erHoesason(skabelon.id, maaned)) {
        punkter.push({
          itemId: item.id,
          titel: item.titel,
          handling: "saelgNu",
          tekst: `Det er højsæson for ${kategori.toLowerCase()} (${hentSaeson(skabelon.id).navn}) — boost den i dag: del den igen eller læg den øverst.`,
          foreslaaetPrisDkk: interval?.p75Dkk,
        });
        continue;
      }

      const naeste = naesteHoesason(skabelon.id, maaned);
      if (naeste && naeste.maanederTil <= 2) {
        punkter.push({
          itemId: item.id,
          titel: item.titel,
          handling: "klarGoer",
          tekst: klargoerTekst(kategori, naeste.maanederTil, naeste.maaned),
        });
        continue;
      }

      if (naeste) {
        punkter.push({
          itemId: item.id,
          titel: item.titel,
          handling: "vent",
          tekst: `Bedst sælges ${kategori.toLowerCase()} i ${maanedsnavn(naeste.maaned)} — vent, og spar kræfterne til da.`,
        });
      }
      continue;
    }

    // Kladder: rådet handler om at komme i gang i rette tid
    if (item.status === "draft") {
      const naeste = naesteHoesason(skabelon.id, maaned);
      if (erHoesason(skabelon.id, maaned) || (naeste && naeste.maanederTil <= 1)) {
        punkter.push({
          itemId: item.id,
          titel: item.titel,
          handling: "klarGoer",
          tekst: klargoerTekst(kategori, erHoesason(skabelon.id, maaned) ? 0 : naeste?.maanederTil ?? null, naeste?.maaned ?? null),
        });
      }
    }
  }

  return punkter
    .sort((a, b) => PRIORITET[a.handling] - PRIORITET[b.handling])
    .slice(0, MAKS_PUNKTER);
}
