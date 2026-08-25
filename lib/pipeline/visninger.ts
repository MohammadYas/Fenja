// Visningstyper (ejer-ordre 2026-08-20): brugeren VÆLGER selv hvilke billeder
// Selja skal generere — spejlbillede, på gulvet, på bøjle, nærbillede — i
// stedet for ét automatisk valgt billede. 1 kredit pr. billede (ejer-
// definition). Filen er klient-sikker (ingen server-imports): wizard-trinnet
// viser kataloget med eksempelbilleder fra forsideserien.

import { vaelgSkabelon } from "./skabeloner";

export type VisningsTypeId = "spejl" | "gulv" | "stativ" | "detalje";

export type VisningsType = {
  id: VisningsTypeId;
  version: number;
  navn: string;
  /** Kort dansk forklaring til vælgeren i wizard-trin 4 */
  beskrivelse: string;
  /** onmodel = tøjet båret (kategori-skabelonens spejl-framing); produkt = uden person */
  slags: "onmodel" | "produkt";
  /** Kun produkt-visninger: framing-blokken (engelsk, C-2: aldrig tøjets udseende) */
  framing?: string;
};

export const VISNINGS_TYPER: readonly VisningsType[] = [
  {
    id: "spejl",
    version: 1,
    navn: "Spejlbillede",
    beskrivelse: "Tøjet vist båret i spejlet. Ansigtet er altid skjult.",
    slags: "onmodel",
  },
  {
    id: "gulv",
    version: 1,
    navn: "På gulvet",
    beskrivelse: "Lagt pænt frem på gulv eller seng, set lige oppefra.",
    slags: "produkt",
    framing:
      "the garment laid out flat and neatly on a clean floor or bed, photographed straight from above so the whole garment is visible",
  },
  {
    id: "stativ",
    version: 1,
    navn: "På bøjle",
    beskrivelse: "Hængt op på en bøjle mod en rolig baggrund.",
    slags: "produkt",
    framing:
      "the garment hanging on a simple wooden hanger against a calm neutral wall or door, photographed straight on with the whole garment visible",
  },
  {
    id: "detalje",
    version: 1,
    navn: "Nærbillede",
    beskrivelse: "Tæt på stof og detaljer: syninger, knapper, print.",
    slags: "produkt",
    framing:
      "a close-up of the garment's fabric and key details such as seams, buttons, hardware or print, filling the frame with realistic texture",
  },
] as const;

/** Standardvalget når intet er valgt (gamle kald, regenerering): båret i spejl */
export const STANDARD_VISNING_ID: VisningsTypeId = "spejl";

const EFTER_ID = new Map(VISNINGS_TYPER.map((v) => [v.id, v]));

export function hentVisningsType(id: string): VisningsType | undefined {
  return EFTER_ID.get(id as VisningsTypeId);
}

/** Valider + dedupliker et råt visningsvalg fra API'et; [] ved intet gyldigt */
export function normaliserVisningsvalg(raa: unknown): VisningsType[] {
  if (!Array.isArray(raa)) return [];
  const set = new Set<VisningsTypeId>();
  for (const id of raa) {
    const type = typeof id === "string" ? hentVisningsType(id) : undefined;
    if (type) set.add(type.id);
  }
  return [...set].map((id) => EFTER_ID.get(id)!);
}

// Eksempelbilleder pr. (kategori-skabelon × visningstype) fra forsideserien —
// alle er AI-genererede og viser STILEN, aldrig brugerens eget tøj.
// Ejer-valg 25/8: cardigan-billedet (p2) er det bedste dameeksempel og er
// standard for overdel/generisk — p15 er faktisk en mand (verificeret ved
// selvsyn) og var et misvisende standardvalg for en overvejende kvindelig
// målgruppe.
const SPEJL_EKSEMPLER: Record<string, string> = {
  kjole: "/eksempler/katalog/p4-sovevaerelse-kjole.webp",
  bukser: "/eksempler/katalog/p5-walkin-jeans.webp",
  jakke: "/eksempler/katalog/p2-entre-cardigan.webp",
  overdel: "/eksempler/katalog/p2-entre-cardigan.webp",
  taske: "/eksempler/katalog/p7-entre-taske.webp",
  generisk: "/eksempler/katalog/p2-entre-cardigan.webp",
};

const PRODUKT_PREFIX: Record<string, string> = {
  kjole: "kjole",
  bukser: "jeans",
  jakke: "jakke",
  overdel: "striktroeje",
  taske: "taske",
  generisk: "striktroeje",
};

/** Eksempelbillede for en visningstype, matchet til itemets kategori */
export function eksempelBillede(typeId: VisningsTypeId, kategori: string): string {
  const skabelonId = vaelgSkabelon(kategori).id;
  if (typeId === "spejl") {
    return SPEJL_EKSEMPLER[skabelonId] ?? SPEJL_EKSEMPLER.generisk!;
  }
  const prefix = PRODUKT_PREFIX[skabelonId] ?? PRODUKT_PREFIX.generisk!;
  return `/eksempler/katalog/${prefix}-${typeId === "gulv" ? "gulv" : typeId === "stativ" ? "stativ" : "detalje"}.webp`;
}

// Spejl-eksempler i BEGGE køn (ejer-ordre 25/8: trialens låste stilarter skal
// vise både dame- og herre-eksempler). Kønnet pr. fil er verificeret ved
// selvsyn 25/8 — bemærk at p15 (det gamle overdel-eksempel) faktisk er en
// mand. Kategorier uden eksempel i et køn falder tilbage til det generiske
// spejlbillede i samme køn — aldrig til det modsatte.
const SPEJL_DAME: Record<string, string> = {
  kjole: "/eksempler/katalog/p4-sovevaerelse-kjole.webp",
  bukser: "/eksempler/katalog/p5-walkin-jeans.webp",
  jakke: "/eksempler/katalog/p2-entre-cardigan.webp",
  // Ejer-valg 25/8: cardigan-billedet er det bedste dameeksempel
  overdel: "/eksempler/katalog/p2-entre-cardigan.webp",
  taske: "/eksempler/katalog/p7-entre-taske.webp",
  generisk: "/eksempler/katalog/p2-entre-cardigan.webp",
};

const SPEJL_HERRE: Record<string, string> = {
  bukser: "/eksempler/katalog/p19-efter-jeans-mand.webp",
  jakke: "/eksempler/katalog/p8-opgang-frakke-mand.webp",
  overdel: "/eksempler/katalog/p6-vaerelse-strik-mand.webp",
  generisk: "/eksempler/katalog/p6-vaerelse-strik-mand.webp",
};

/** Dame- og herre-spejleksempel for en kategori (trialens låste stilarter) */
export function spejlEksempelPar(kategori: string): { dame: string; herre: string } {
  const skabelonId = vaelgSkabelon(kategori).id;
  return {
    dame: SPEJL_DAME[skabelonId] ?? SPEJL_DAME.generisk!,
    herre: SPEJL_HERRE[skabelonId] ?? SPEJL_HERRE.generisk!,
  };
}

/** Versions-tag i generations.prompt_version-formatet: "id@vN" (FR-15) */
export function visningVersionsTag(visning: VisningsType): string {
  return `${visning.id}@v${visning.version}`;
}
