// Aggregerer alle høstede snapshots til markedsstatistik:
// data/markedsanalyse/raa/*.json → data/markedsanalyse/markedsstatistik.json
//
//   npx tsx scripts/markedsanalyse/analyser.ts

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  beregnGruppe,
  dedupPaaId,
  grupperEfter,
  type Gruppestatistik,
  type MarkedsItem,
  type Snapshot,
} from "./faelles";

export type SoegningsStatistik = {
  soegning: string;
  soegetekst: string;
  kategori: string;
  /** Største observerede samlede udbud for søgningen */
  totaltUdbud: number | null;
  stat: Gruppestatistik;
  /** Fordeling pr. stand, sorteret efter antal */
  prStand: { stand: string; antal: number; medianPris: number }[];
};

export type Markedsstatistik = {
  genereretTs: number;
  antalAnnoncer: number;
  soegninger: SoegningsStatistik[];
};

async function laesSnapshots(mappe: string): Promise<Snapshot[]> {
  const filer = (await readdir(mappe)).filter((f) => f.endsWith(".json"));
  const snapshots: Snapshot[] = [];
  for (const fil of filer) {
    const indhold = await readFile(path.join(mappe, fil), "utf8");
    snapshots.push(JSON.parse(indhold) as Snapshot);
  }
  return snapshots;
}

export function beregnMarkedsstatistik(
  snapshots: Snapshot[],
  nuTs: number,
): Markedsstatistik {
  const alleItems = dedupPaaId(snapshots.flatMap((s) => s.items));
  const prSoegning = grupperEfter(alleItems, (i) => i.soegning);

  const soegninger: SoegningsStatistik[] = [];
  for (const [navn, items] of prSoegning) {
    const stat = beregnGruppe(items, nuTs);
    if (!stat) continue;
    const kilde = snapshots.find((s) => s.soegning.navn === navn);
    const udbud = snapshots
      .filter((s) => s.soegning.navn === navn)
      .map((s) => s.totaltUdbud)
      .filter((u): u is number => u !== null);
    const prStand = [...grupperEfter(
      items.filter((i): i is MarkedsItem & { stand: string } => i.stand !== null),
      (i) => i.stand,
    )]
      .map(([stand, standItems]) => {
        const standStat = beregnGruppe(standItems, nuTs);
        return standStat
          ? { stand, antal: standStat.antal, medianPris: standStat.medianPris }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.antal - a.antal);
    soegninger.push({
      soegning: navn,
      soegetekst: kilde?.soegning.soegetekst ?? navn,
      kategori: kilde?.soegning.kategori ?? "Ukendt",
      totaltUdbud: udbud.length > 0 ? Math.max(...udbud) : null,
      stat,
      prStand,
    });
  }
  soegninger.sort(
    (a, b) => a.kategori.localeCompare(b.kategori, "da") || a.soegning.localeCompare(b.soegning, "da"),
  );
  return { genereretTs: nuTs, antalAnnoncer: alleItems.length, soegninger };
}

async function koer(): Promise<void> {
  const rod = path.join("data", "markedsanalyse");
  const snapshots = await laesSnapshots(path.join(rod, "raa"));
  if (snapshots.length === 0) {
    console.error("Ingen snapshots i data/markedsanalyse/raa — kør hent.ts først.");
    process.exitCode = 1;
    return;
  }
  const statistik = beregnMarkedsstatistik(snapshots, Math.floor(Date.now() / 1000));
  await mkdir(rod, { recursive: true });
  const fil = path.join(rod, "markedsstatistik.json");
  await writeFile(fil, JSON.stringify(statistik, null, 1), "utf8");
  console.log(
    `Statistik for ${statistik.antalAnnoncer} annoncer i ${statistik.soegninger.length} søgninger → ${fil}`,
  );
}

// Kør kun som CLI — modulet importeres også af rapport.ts og tests
if (process.argv[1]?.endsWith("analyser.ts")) {
  koer().catch((fejl) => {
    console.error("Analysen fejlede:", fejl instanceof Error ? fejl.message : fejl);
    process.exitCode = 1;
  });
}
