// Pris-trappe (abonnent-fordel, 22/8): en konkret nedtrapningsplan pr. aktiv
// annonce — start på markedets øvre kvartil, træd ned mod medianen efter to
// uger og mod p25 efter fire, til den er solgt. Smart Salgsplan siger hvad du
// skal gøre I DAG; trappen viser hele prisplanen frem i tiden, så sælgeren
// aldrig skal gætte "hvornår sætter jeg ned, og til hvad?". Rene funktioner
// over annoncerne og den committede markedshøst.

import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";

export type TrappeInputItem = {
  id: string;
  titel: string;
  maerke: string;
  kategori: string;
  status: "draft" | "active" | "sold";
  /** Hvornår annoncen blev leveret — trappen tæller dage herfra */
  leveretAt: string | null;
  prisTilDkk: number | null;
};

export type TrappeTrin = {
  /** Trinnet gælder fra denne dag på hylden (0 = fra leverancen) */
  fraDag: number;
  prisDkk: number;
};

export type TrappePunkt = {
  itemId: string;
  titel: string;
  trin: TrappeTrin[];
  /** Dage annoncen har ligget — null hvis leverancetidspunktet mangler */
  dagePaaTrappen: number | null;
  /** Indeks i trin[] for det trin, annoncen er nået til (0 uden leverancetid) */
  aktueltTrin: number;
  antalBag: number;
};

// Trappens dage — samme rytme som salgsplanens "sæt ned efter 14 dage"
export const TRAPPE_DAGE = [0, 14, 28] as const;
export const MAKS_TRAPPER = 5;

function dageSiden(iso: string, nu: Date): number {
  return Math.max(0, Math.floor((nu.getTime() - new Date(iso).getTime()) / 86_400_000));
}

export function bygPrisTrappe(
  items: readonly TrappeInputItem[],
  nu: Date = new Date(),
): TrappePunkt[] {
  const punkter: TrappePunkt[] = [];

  for (const item of items) {
    if (item.status !== "active") continue;
    const interval = findMarkedsinterval(item.maerke, item.kategori);
    if (!interval) continue;

    // Startprisen er annoncens eget prisforslag, ellers markedets p75. De
    // næste trin er median og p25 — men kun strengt faldende trin tælles
    // med, så en annonce, der allerede ligger i bunden, ikke rådes længere ned.
    const start = item.prisTilDkk ?? interval.p75Dkk;
    const kandidater = [start, interval.medianDkk, interval.p25Dkk];
    const trin: TrappeTrin[] = [];
    for (const pris of kandidater) {
      if (pris <= 0) continue;
      const forrige = trin[trin.length - 1];
      if (forrige && pris >= forrige.prisDkk) continue;
      trin.push({ fraDag: TRAPPE_DAGE[trin.length] ?? 0, prisDkk: pris });
    }
    // Én pris er ingen trappe — så er der ikke noget at planlægge
    if (trin.length < 2) continue;

    const dage = item.leveretAt ? dageSiden(item.leveretAt, nu) : null;
    let aktueltTrin = 0;
    if (dage != null) {
      for (let i = 0; i < trin.length; i++) {
        if (dage >= trin[i]!.fraDag) aktueltTrin = i;
      }
    }

    punkter.push({
      itemId: item.id,
      titel: item.titel,
      trin,
      dagePaaTrappen: dage,
      aktueltTrin,
      antalBag: interval.antal,
    });
  }

  // De længst liggende først — det er dem, trappen skal redde
  return punkter
    .sort((a, b) => (b.dagePaaTrappen ?? -1) - (a.dagePaaTrappen ?? -1))
    .slice(0, MAKS_TRAPPER);
}
