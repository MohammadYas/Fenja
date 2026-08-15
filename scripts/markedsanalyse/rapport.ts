// Dansk markdown-rapport af markedsstatistikken:
// data/markedsanalyse/markedsstatistik.json → data/markedsanalyse/rapport.md
//
//   npx tsx scripts/markedsanalyse/rapport.ts

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { formaterKr, formaterTal } from "./faelles";
import type { Markedsstatistik, SoegningsStatistik } from "./analyser";

function efterspoergselsTekst(medianFavoritterPrDag: number | null): string {
  if (medianFavoritterPrDag === null) return "—";
  return `${formaterTal(medianFavoritterPrDag, 2)} fav./dag`;
}

// Kataloget viser højst 10 sider × 96 — total_entries er altså cappet.
// Ved loftet skriver vi ærligt "≥ 960" i stedet for et præcist tal.
const UDBUDS_LOFT = 960;

function udbudsTekst(totaltUdbud: number | null): string {
  if (totaltUdbud === null) return "?";
  if (totaltUdbud >= UDBUDS_LOFT) return `≥ ${UDBUDS_LOFT.toLocaleString("da-DK")}`;
  return totaltUdbud.toLocaleString("da-DK");
}

function raekke(s: SoegningsStatistik): string {
  return [
    "",
    `**${s.soegetekst}**`,
    udbudsTekst(s.totaltUdbud),
    formaterKr(s.stat.medianPris),
    `${formaterKr(s.stat.p25Pris)} – ${formaterKr(s.stat.p75Pris)}`,
    efterspoergselsTekst(s.stat.medianFavoritterPrDag),
    `${Math.round(s.stat.andelNyMedPrismaerke * 100)} %`,
    "",
  ].join(" | ");
}

export function byggRapport(statistik: Markedsstatistik): string {
  const dato = new Date(statistik.genereretTs * 1000).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const linjer: string[] = [
    "# Markedsanalyse — Vinted Danmark",
    "",
    `Genereret ${dato} af \`scripts/markedsanalyse\` · ${statistik.antalAnnoncer.toLocaleString("da-DK")} aktive annoncer på tværs af ${statistik.soegninger.length} søgninger.`,
    "",
    "## Forbehold — læs først",
    "",
    "- Tallene er **udbudspriser** (hvad sælgere beder om), ikke salgspriser.",
    "  Vinted viser ikke gennemførte handler offentligt, så medianen ligger",
    "  systematisk over det, tingene reelt sælges for.",
    "- Stikprøven er de nyeste annoncer pr. søgning — store udbud er kun",
    "  dækket delvist (se udbuds-kolonnen).",
    "- Efterspørgsel er favoritter pr. dag siden upload (median, kun annoncer",
    "  over ét døgn gamle). Det er en proxy, ikke en facitliste.",
    "",
  ];

  const prKategori = new Map<string, SoegningsStatistik[]>();
  for (const s of statistik.soegninger) {
    const gruppe = prKategori.get(s.kategori);
    if (gruppe) gruppe.push(s);
    else prKategori.set(s.kategori, [s]);
  }

  for (const [kategori, soegninger] of prKategori) {
    linjer.push(
      `## ${kategori}`,
      "",
      "| Søgning | Udbud | Medianpris | Midterspænd (p25–p75) | Efterspørgsel | Ny m. prismærke |",
      "|---|---|---|---|---|---|",
      ...soegninger.map(raekke).map((r) => r.trim()),
      "",
    );
    for (const s of soegninger) {
      const topStande = s.prStand.slice(0, 3);
      if (topStande.length > 0) {
        linjer.push(
          `*${s.soegetekst}* pr. stand: ` +
            topStande
              .map((st) => `${st.stand} (${st.antal} stk., median ${formaterKr(st.medianPris)})`)
              .join(" · "),
          "",
        );
      }
    }
  }

  linjer.push(
    "## Sådan bruger du tallene",
    "",
    "- **Prissæt mod midterspændet:** ligger du under p25 for din stand, er du",
    "  blandt de billigste 25 % af udbuddet — det giver hurtige salg.",
    "- **Stort udbud = pres på prisen.** Jo flere aktive annoncer i søgningen,",
    "  desto vigtigere er gode fotos og en præcis titel for at blive set.",
    "- **Stand flytter prisen.** Sammenlign med medianen for din egen stand",
    "  (pr.-stand-linjerne), ikke søgningens samlede median.",
    "",
  );
  return linjer.join("\n");
}

async function koer(): Promise<void> {
  const rod = path.join("data", "markedsanalyse");
  const indhold = await readFile(path.join(rod, "markedsstatistik.json"), "utf8").catch(
    () => null,
  );
  if (!indhold) {
    console.error("Ingen markedsstatistik.json — kør analyser.ts først.");
    process.exitCode = 1;
    return;
  }
  const statistik = JSON.parse(indhold) as Markedsstatistik;
  const fil = path.join(rod, "rapport.md");
  await writeFile(fil, byggRapport(statistik), "utf8");
  console.log(`Rapport skrevet til ${fil}`);
}

if (process.argv[1]?.endsWith("rapport.ts")) {
  koer().catch((fejl) => {
    console.error("Rapporten fejlede:", fejl instanceof Error ? fejl.message : fejl);
    process.exitCode = 1;
  });
}
