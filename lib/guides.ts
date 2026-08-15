// Lær-guides (F-2) som strukturerede TS-data (ejer-ordre 2026-08-15: ingen
// markdown-filer). Indholdet bor i guides-indhold.ts; denne fil ejer typerne
// og API'et — samme API som før (hentGuides/hentGuide), så siderne er uændrede.

import { guideIndhold } from "./guides-indhold";

export type GuideBlok =
  | { type: "rubrik"; tekst: string }
  | { type: "afsnit"; tekst: string }
  | { type: "liste"; ordnet: boolean; punkter: string[] };

export type GuideIndhold = {
  slug: string;
  titel: string;
  beskrivelse: string;
  raekkefoelge: number;
  blokke: GuideBlok[];
};

export type Guide = GuideIndhold;

export function hentGuides(): readonly Guide[] {
  return [...guideIndhold].sort((a, b) => a.raekkefoelge - b.raekkefoelge);
}

export function hentGuide(slug: string): Guide | null {
  return hentGuides().find((g) => g.slug === slug) ?? null;
}
