// Sæson-kalender (Plus-fordel, 21/8): garderobens 12 måneder — hvornår
// topper hver aktiv annonce/kladde? Én af månederne er ALTID "nu", så
// abonnenten kan se hvad der skal frem af skabet i denne måned og planlægge
// resten af året. Rene funktioner over sæson-tabellen.

import { vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason, maanedsnavn } from "./saeson";

export type KalenderInputItem = {
  id: string;
  titel: string;
  kategori: string;
  status: "draft" | "active" | "sold";
};

export type KalenderMaaned = {
  maaned: number;
  navn: string;
  erNu: boolean;
  /** Titler der topper i denne måned (maks 4 — resten tælles) */
  titler: string[];
  flere: number;
};

export const MAKS_TITLER_PR_MAANED = 4;

export function bygSaesonKalender(
  items: readonly KalenderInputItem[],
  nu: Date = new Date(),
): KalenderMaaned[] {
  const nuMaaned = nu.getMonth() + 1;
  const aktive = items.filter((i) => i.status !== "sold");

  return Array.from({ length: 12 }, (_, i) => {
    const maaned = ((nuMaaned - 1 + i) % 12) + 1;
    const titler = aktive
      .filter((item) => erHoesason(vaelgSkabelon(item.kategori).id, maaned))
      .map((item) => item.titel);
    return {
      maaned,
      navn: maanedsnavn(maaned),
      erNu: maaned === nuMaaned,
      titler: titler.slice(0, MAKS_TITLER_PR_MAANED),
      flere: Math.max(0, titler.length - MAKS_TITLER_PR_MAANED),
    };
  });
}
