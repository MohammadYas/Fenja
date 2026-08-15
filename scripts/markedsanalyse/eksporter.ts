// Eksporterer markedsstatistikken til den committede datafil, som
// prisforslaget (D-4/M2) læser:
// data/markedsanalyse/markedsstatistik.json → lib/data/markedspriser.ts
//
//   npx tsx scripts/markedsanalyse/eksporter.ts
//
// Kun søgninger med maerke + matchOrd i soegninger.ts og mindst MIN_ANTAL
// annoncer bag tallene kommer med. Filen committes bagefter, så appen kan
// bruge tallene uden adgang til analyse-outputtet.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Markedsstatistik } from "./analyser";
import type { Soegning } from "./faelles";
import { SOEGNINGER } from "./soegninger";

/** Under denne stikprøve er medianen for støjende til at styre priser efter */
export const MIN_ANTAL = 30;

export function byggMarkedspriserModul(
  statistik: Markedsstatistik,
  soegninger: Soegning[],
  minAntal: number = MIN_ANTAL,
): string {
  const dato = new Date(statistik.genereretTs * 1000).toISOString().slice(0, 10);
  const rækker: string[] = [];
  for (const gruppe of statistik.soegninger) {
    const opsætning = soegninger.find((s) => s.navn === gruppe.soegning);
    if (!opsætning?.maerke || !opsætning.matchOrd?.length) continue;
    if (gruppe.stat.antal < minAntal) continue;
    rækker.push(
      `  {
    soegetekst: ${JSON.stringify(gruppe.soegetekst)},
    maerke: ${JSON.stringify(opsætning.maerke)},
    matchOrd: ${JSON.stringify(opsætning.matchOrd)},
    antal: ${gruppe.stat.antal},
    p25Dkk: ${Math.round(gruppe.stat.p25Pris)},
    medianDkk: ${Math.round(gruppe.stat.medianPris)},
    p75Dkk: ${Math.round(gruppe.stat.p75Pris)},
    hoestetDato: ${JSON.stringify(dato)},
  },`,
    );
  }

  return `// GENERERET af scripts/markedsanalyse/eksporter.ts — redigér ikke i hånden.
// Opdatér med en frisk høst og commit resultatet:
//   npm run analyse:hent && npm run analyse:beregn && npm run analyse:eksport
// Tom liste = prisforslaget kører uden markedslinje (som før M2).

export type Markedsinterval = {
  /** Søgningen tallene stammer fra, fx "ganni kjole" */
  soegetekst: string;
  /** Mærke der skal matche items mærkefelt (normaliseret sammenligning) */
  maerke: string;
  /** Mindst ét af disse ord skal indgå i items kategori */
  matchOrd: string[];
  /** Antal aktive annoncer bag tallene */
  antal: number;
  p25Dkk: number;
  medianDkk: number;
  p75Dkk: number;
  /** ISO-dato for høsten, fx "2026-08-15" */
  hoestetDato: string;
};

export const MARKEDSPRISER: Markedsinterval[] = [
${rækker.join("\n")}
];
`;
}

async function koer(): Promise<void> {
  const kildefil = path.join("data", "markedsanalyse", "markedsstatistik.json");
  const indhold = await readFile(kildefil, "utf8").catch(() => null);
  if (!indhold) {
    console.error("Ingen markedsstatistik.json — kør analyse:hent og analyse:beregn først.");
    process.exitCode = 1;
    return;
  }
  const statistik = JSON.parse(indhold) as Markedsstatistik;
  const modul = byggMarkedspriserModul(statistik, SOEGNINGER);
  const maalfil = path.join("lib", "data", "markedspriser.ts");
  await writeFile(maalfil, modul, "utf8");
  // Én række pr. interval-objekt i den genererede liste
  const antal = (modul.match(/^ {2}\{$/gm) ?? []).length;
  console.log(`Skrev ${maalfil} (${antal} intervaller). Kør lint/test og commit filen.`);
}

if (process.argv[1]?.endsWith("eksporter.ts")) {
  koer().catch((fejl) => {
    console.error("Eksporten fejlede:", fejl instanceof Error ? fejl.message : fejl);
    process.exitCode = 1;
  });
}
