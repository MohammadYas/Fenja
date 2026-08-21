// Konkurrent-tjek (Pro-fordel, 21/8): hver aktiv annonces prisforslag holdt
// op mod markedets p25/median/p75 for samme mærke+kategori — hvor ligger du,
// og hvad betyder det for salgstiden? Rene funktioner over markedshøsten.

import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";

export type KonkurrentInputItem = {
  id: string;
  titel: string;
  maerke: string;
  kategori: string;
  status: "draft" | "active" | "sold";
  prisTilDkk: number | null;
};

export type PrisPosition = "billigst" | "under_median" | "over_median" | "dyrest";

export type KonkurrentPunkt = {
  itemId: string;
  titel: string;
  dinPrisDkk: number;
  p25Dkk: number;
  medianDkk: number;
  p75Dkk: number;
  antalBag: number;
  position: PrisPosition;
  /** Færdig sætning: hvad positionen betyder for salget */
  tekst: string;
};

function positionFor(pris: number, p25: number, median: number, p75: number): PrisPosition {
  if (pris <= p25) return "billigst";
  if (pris <= median) return "under_median";
  if (pris <= p75) return "over_median";
  return "dyrest";
}

const TEKST: Record<PrisPosition, (median: number) => string> = {
  billigst: () => "Blandt de billigste på markedet — sælger typisk hurtigst, men du efterlader måske penge på bordet.",
  under_median: () => "Under markedets midte — god balance mellem pris og salgstid.",
  over_median: (median) => `Over markedets midte (${median} kr.) — regn med længere liggetid, eller sæt tættere på midten.`,
  dyrest: (median) => `Blandt de dyreste — de fleste lignende sælges omkring ${median} kr. Overvej at sætte ned, hvis den skal afsted.`,
};

export function bygKonkurrentTjek(
  items: readonly KonkurrentInputItem[],
): KonkurrentPunkt[] {
  const punkter: KonkurrentPunkt[] = [];
  for (const item of items) {
    if (item.status !== "active" || item.prisTilDkk == null) continue;
    const interval = findMarkedsinterval(item.maerke, item.kategori);
    if (!interval) continue;
    const position = positionFor(
      item.prisTilDkk,
      interval.p25Dkk,
      interval.medianDkk,
      interval.p75Dkk,
    );
    punkter.push({
      itemId: item.id,
      titel: item.titel,
      dinPrisDkk: item.prisTilDkk,
      p25Dkk: interval.p25Dkk,
      medianDkk: interval.medianDkk,
      p75Dkk: interval.p75Dkk,
      antalBag: interval.antal,
      position,
      tekst: TEKST[position](interval.medianDkk),
    });
  }
  // Dem der ligger dyrest først — det er dér, der er noget at handle på
  const orden: PrisPosition[] = ["dyrest", "over_median", "under_median", "billigst"];
  return punkter.sort(
    (a, b) => orden.indexOf(a.position) - orden.indexOf(b.position),
  );
}
