// Sæson-tabel for dansk genbrugstøj (Smart Salgsplan, ejer-ordre 20/8).
// Nøglet på kategori-skabelon-id (lib/pipeline/skabeloner.ts), så salgsplanen
// genbruger præcis den samme kategorisering som prompt-systemet. Månederne er
// 1-baserede (1 = januar). Kilde: guides-indholdets sæson-afsnit — samme
// vurdering, som brugeren allerede kan læse sig til på /laer.

export type Saeson = {
  bedsteMaaneder: readonly number[];
  /** Kort dansk beskrivelse til rådenes begrundelser */
  navn: string;
};

export const SAESON: Record<string, Saeson> = {
  kjole: { bedsteMaaneder: [4, 5, 6, 7, 8], navn: "forår og sommer" },
  bukser: { bedsteMaaneder: [8, 9, 10, 11, 12, 1], navn: "efterår og vinter" },
  shorts: { bedsteMaaneder: [4, 5, 6, 7, 8], navn: "forår og sommer" },
  jakke: { bedsteMaaneder: [9, 10, 11, 12, 1, 2], navn: "efterår og vinter" },
  overdel: {
    bedsteMaaneder: [1, 2, 3, 4, 5, 9, 10, 11, 12],
    navn: "det meste af året",
  },
  taske: { bedsteMaaneder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], navn: "hele året" },
  generisk: {
    bedsteMaaneder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    navn: "hele året",
  },
};

const MAANEDSNAVNE = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
] as const;

export function maanedsnavn(maaned: number): string {
  return MAANEDSNAVNE[((maaned - 1) % 12 + 12) % 12]!;
}

export function hentSaeson(skabelonId: string): Saeson {
  return SAESON[skabelonId] ?? SAESON.generisk!;
}

export function erHoesason(skabelonId: string, maaned: number): boolean {
  return hentSaeson(skabelonId).bedsteMaaneder.includes(maaned);
}

/**
 * Antal måneder til næste højsæson-måned (1..12), eller null hvis hele året
 * er højsæson. 1 = allerede næste måned; 0 optræder aldrig, fordi "nu" er
 * håndteret i erHoesason.
 */
export function naesteHoesason(
  skabelonId: string,
  maaned: number,
): { maanederTil: number; maaned: number } | null {
  const saeson = hentSaeson(skabelonId);
  if (saeson.bedsteMaaneder.length >= 12) return null;
  for (let d = 1; d <= 11; d++) {
    const kandidat = ((maaned - 1 + d) % 12) + 1;
    if (saeson.bedsteMaaneder.includes(kandidat)) {
      return { maanederTil: d, maaned: kandidat };
    }
  }
  return null;
}
