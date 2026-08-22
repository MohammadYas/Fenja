// Annonce-doktor (abonnent-fordel, 22/8 — ejer: "en meget bedre funktion").
// Sundhedstjek af hver aktiv annonce: en score 0-100 og KONKRETE råd om det,
// der holder den fra at sælge — manglende fotos, pris mod markedet, sæson,
// liggetid og titel. Plus ser de annoncer, der trænger mest (loftet
// DOKTOR_PLUS_ANTAL); Pro ser alle. Rene funktioner over annoncerne, den
// committede markedshøst og sæson-tabellen — fuldt testbare uden database.

import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";
import { vaelgSkabelon } from "@/lib/pipeline/skabeloner";
import { erHoesason, maanedsnavn, naesteHoesason } from "./saeson";

export type DoktorInputItem = {
  id: string;
  titel: string;
  maerke: string;
  kategori: string;
  status: "draft" | "active" | "sold";
  leveretAt: string | null;
  prisTilDkk: number | null;
  /** Roller fra item_photos: "full" | "back" | "label" | "defect" */
  fotoRoller: readonly string[];
};

export type DoktorPunkt = {
  itemId: string;
  titel: string;
  /** 0-100 — andelen af beståede tjek, vægtet */
  score: number;
  /** Konkrete råd for de tjek, der fejlede — vigtigste først */
  raad: string[];
};

export const DOKTOR_PLUS_ANTAL = 3;
export const DOKTOR_LIGGETID_DAGE = 28;

type Tjek = { vaegt: number; ok: boolean; raad: string };

function dageSiden(iso: string, nu: Date): number {
  return Math.max(0, Math.floor((nu.getTime() - new Date(iso).getTime()) / 86_400_000));
}

export function bygAnnonceDoktor(
  items: readonly DoktorInputItem[],
  nu: Date = new Date(),
): DoktorPunkt[] {
  const maaned = nu.getMonth() + 1;
  const punkter: DoktorPunkt[] = [];

  for (const item of items) {
    if (item.status !== "active") continue;
    const tjekliste: Tjek[] = [];
    const kategori = item.kategori.trim().toLowerCase() || "annoncen";

    // Fotos: bagside og vaskemærke besvarer de spørgsmål, købere ellers
    // stiller i beskeder — hver manglende koster
    tjekliste.push({
      vaegt: 10,
      ok: item.fotoRoller.includes("back"),
      raad: "Tilføj et bagsidefoto. Købere spørger ellers efter det i beskeder.",
    });
    tjekliste.push({
      vaegt: 10,
      ok: item.fotoRoller.includes("label"),
      raad: "Tilføj et foto af vaskemærket. Det svarer på størrelse og materiale, før nogen behøver spørge.",
    });

    // Pris mod markedet (kun når høsten kender mærke+kategori)
    const interval = findMarkedsinterval(item.maerke, item.kategori);
    if (interval && item.prisTilDkk != null) {
      tjekliste.push({
        vaegt: 25,
        ok: item.prisTilDkk <= interval.p75Dkk,
        raad: `Prisen ligger over markedets øvre kvartil (${interval.p75Dkk} kr.). Lignende sælges typisk for ${interval.medianDkk} kr.`,
      });
      tjekliste.push({
        vaegt: 10,
        ok: item.prisTilDkk >= interval.p25Dkk,
        raad: `Prisen ligger under markedets nedre kvartil (${interval.p25Dkk} kr.). Du kan formentlig tage mere.`,
      });
    }

    // Sæson: uden for sæson sælger tøjet mærkbart langsommere
    const skabelon = vaelgSkabelon(item.kategori);
    const naeste = naesteHoesason(skabelon.id, maaned);
    tjekliste.push({
      vaegt: 20,
      ok: erHoesason(skabelon.id, maaned),
      raad: naeste
        ? `Lavsæson for ${kategori} — topper i ${maanedsnavn(naeste.maaned)}. Vent, eller sæt prisen skarpt nu.`
        : `Lavsæson for ${kategori} lige nu. Sæt prisen skarpt, hvis den skal afsted.`,
    });

    // Liggetid: efter 4 uger er annoncen kold — gør noget aktivt
    if (item.leveretAt) {
      const dage = dageSiden(item.leveretAt, nu);
      tjekliste.push({
        vaegt: 15,
        ok: dage < DOKTOR_LIGGETID_DAGE,
        raad: `Har ligget ${dage} dage. Følg pris-trappen ned, eller genopslå annoncen, så den ligger friskt i søgningen.`,
      });
    }

    // Titel: mærket er det, købere søger på
    if (item.maerke.trim() !== "") {
      tjekliste.push({
        vaegt: 10,
        ok: item.titel.toLowerCase().includes(item.maerke.trim().toLowerCase()),
        raad: `Sæt mærket (${item.maerke}) forrest i titlen — det er det, købere søger på.`,
      });
    }

    const samletVaegt = tjekliste.reduce((sum, t) => sum + t.vaegt, 0);
    if (samletVaegt === 0) continue;
    const bestaaet = tjekliste
      .filter((t) => t.ok)
      .reduce((sum, t) => sum + t.vaegt, 0);
    punkter.push({
      itemId: item.id,
      titel: item.titel,
      score: Math.round((bestaaet / samletVaegt) * 100),
      raad: tjekliste
        .filter((t) => !t.ok)
        .sort((a, b) => b.vaegt - a.vaegt)
        .map((t) => t.raad),
    });
  }

  // Lavest score først — det er dér, der er penge at hente
  return punkter.sort((a, b) => a.score - b.score);
}
