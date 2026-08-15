// Gate 1 (HANDOFF §8): troskabs-pass-rate ≥ 70 % målt på rigtige tøjfotos.
// Ejeren kører den hjemme (HANDOFF §6, trin 4) med FAL_KEY + ANTHROPIC_API_KEY:
//
//   npx tsx scripts/gate1-fidelity-test.ts --mappe ~/toejfotos
//   npx tsx scripts/gate1-fidelity-test.ts --mappe ~/toejfotos --preset alle
//
// Uden nøgler (eller med MOCK_PROVIDERS=1) køres mod mock-providers — det
// verificerer selve scriptet, men måler IKKE Gate 1. Resultatet skrives til
// data/gate1/ (gitignoreret) og opsummeres i terminalen; pass-raten føres
// derefter ind i STATUS.md, og pipeline.troskabsTaerskel kalibreres ud fra
// tærskeltabellen (S12 trin 1–2).
//
// Genbruger den ÆGTE pipeline-logik (rens → on-model m. retry → troskab), så
// målingen matcher det, appen faktisk gør.

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline as cfg } from "@/lib/config";
import { genererOnModelMedTroskab } from "@/lib/pipeline/onmodel";
import { PRESETS, STANDARD_PRESET_ID } from "@/lib/pipeline/presets";
import {
  erMockTilstand,
  hentImageProvider,
  hentTextProvider,
} from "@/lib/providers";

const BILLED_ENDELSER = new Map<string, string>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

// Skøn pr. foto pr. preset: rens 0,10 + op til 2 × (on-model 0,45 + vision 0,05)
const SKOEN_KR_PR_KOERSEL = 0.1 + cfg.onModelForsoeg * 0.5;

type Koersel = {
  foto: string;
  presetId: string;
  bestaaet: boolean;
  forsoeg: number;
  scores: number[];
  costDkk: number;
  fejl: string | null;
};

function laesArgumenter(argv: string[]): { mappe: string; presetIder: string[]; maks: number } {
  const hent = (navn: string): string | null => {
    const i = argv.indexOf(`--${navn}`);
    const vaerdi = i >= 0 ? argv[i + 1] : undefined;
    return vaerdi !== undefined ? vaerdi : null;
  };
  const preset = hent("preset") ?? STANDARD_PRESET_ID;
  const presetIder =
    preset === "alle" ? PRESETS.map((p) => p.id) : [preset];
  for (const id of presetIder) {
    if (!PRESETS.some((p) => p.id === id)) {
      throw new Error(`Ukendt preset "${id}". Kendte: ${PRESETS.map((p) => p.id).join(", ")} eller "alle".`);
    }
  }
  return {
    mappe: hent("mappe") ?? path.join("data", "gate1", "fotos"),
    presetIder,
    maks: Math.max(1, Number(hent("maks") ?? 25)),
  };
}

/** Mock: filstien er en fin opak "URL". Rigtige providers kræver en offentlig
 *  URL — filen uploades til fal storage (samme konto som genereringen). */
async function klargoerReferenceUrl(filsti: string, mock: boolean): Promise<string> {
  if (mock) return `fil://${path.basename(filsti)}`;
  const { fal } = await import("@fal-ai/client");
  const type = BILLED_ENDELSER.get(path.extname(filsti).toLowerCase()) ?? "image/jpeg";
  const indhold = await readFile(filsti);
  const fil = new File([new Uint8Array(indhold)], path.basename(filsti), { type });
  return fal.storage.upload(fil);
}

function procent(andel: number): string {
  return `${Math.round(andel * 100)} %`;
}

/** Pass-rate ved kandidat-tærskel t, målt på de scores der faktisk findes.
 *  Eksakt for t ≤ den konfigurerede tærskel; konservativ (undervurderet) for
 *  t > tærsklen, fordi bestået-i-første-forsøg aldrig fik sit retry. */
function passRateVed(koersler: Koersel[], t: number): number {
  const medScores = koersler.filter((k) => k.scores.length > 0);
  if (medScores.length === 0) return 0;
  const bestaaet = medScores.filter((k) => Math.max(...k.scores) >= t).length;
  return bestaaet / medScores.length;
}

async function koer(): Promise<void> {
  const arg = laesArgumenter(process.argv.slice(2));
  const mock = erMockTilstand();

  const filer = (await readdir(arg.mappe).catch(() => null))
    ?.filter((f) => BILLED_ENDELSER.has(path.extname(f).toLowerCase()))
    .sort()
    .slice(0, arg.maks);
  if (!filer || filer.length === 0) {
    console.error(
      `Ingen fotos i ${arg.mappe} — læg ~20 tøjfotos (jpg/png/webp) i mappen eller peg med --mappe.`,
    );
    process.exitCode = 1;
    return;
  }

  const antalKoersler = filer.length * arg.presetIder.length;
  console.log(
    `Gate 1-måling: ${filer.length} fotos × ${arg.presetIder.length} preset(s) = ${antalKoersler} kørsler`,
  );
  if (mock) {
    console.log("TILSTAND: MOCK (ingen nøgler) — verificerer scriptet, måler ikke Gate 1.\n");
  } else {
    console.log(
      `TILSTAND: RIGTIGE providers — skønnet maks. omkostning ~${(antalKoersler * SKOEN_KR_PR_KOERSEL).toFixed(0)} kr. (NFR-11)\n`,
    );
  }

  const image = await hentImageProvider();
  const text = await hentTextProvider();
  const koersler: Koersel[] = [];

  for (const fil of filer) {
    const filsti = path.join(arg.mappe, fil);
    let rensetUrl: string;
    try {
      const referenceUrl = await klargoerReferenceUrl(filsti, mock);
      const rens = await image.rensBaggrund({ fotoUrl: referenceUrl });
      rensetUrl = rens.url;
    } catch (fejl) {
      const besked = fejl instanceof Error ? fejl.message : String(fejl);
      console.log(`  ${fil}: rens/upload fejlede (${besked}) — springer fotoet over`);
      for (const presetId of arg.presetIder) {
        koersler.push({ foto: fil, presetId, bestaaet: false, forsoeg: 0, scores: [], costDkk: 0, fejl: besked });
      }
      continue;
    }

    for (const presetId of arg.presetIder) {
      const udfald = await genererOnModelMedTroskab({
        image,
        text,
        itemId: `gate1-${fil}-${presetId}`,
        presetId,
        referenceUrl: rensetUrl,
      });
      koersler.push({
        foto: fil,
        presetId,
        bestaaet: udfald.billede !== null,
        forsoeg: udfald.forsoeg,
        scores: udfald.scores,
        costDkk: udfald.costDkk,
        fejl: null,
      });
      const bedste = udfald.scores.length > 0 ? Math.max(...udfald.scores).toFixed(2) : "—";
      console.log(
        `  ${fil} × ${presetId}: ${udfald.billede ? "BESTÅET" : "ikke bestået"} (bedste score ${bedste}, ${udfald.forsoeg} forsøg)`,
      );
    }
  }

  // Opsummering
  const gyldige = koersler.filter((k) => k.fejl === null);
  const passRate = gyldige.length > 0 ? gyldige.filter((k) => k.bestaaet).length / gyldige.length : 0;
  const totalCost = koersler.reduce((sum, k) => sum + k.costDkk, 0);

  console.log(`\n== GATE 1 ==`);
  console.log(
    `Pass-rate: ${procent(passRate)} (${gyldige.filter((k) => k.bestaaet).length}/${gyldige.length} kørsler, tærskel ${cfg.troskabsTaerskel}) — krav: ≥ 70 %`,
  );
  console.log(`Samlet omkostning: ${totalCost.toFixed(2)} kr. (~${gyldige.length > 0 ? (totalCost / gyldige.length).toFixed(2) : "0"} kr./kørsel)`);

  for (const presetId of arg.presetIder) {
    const prPreset = gyldige.filter((k) => k.presetId === presetId);
    if (prPreset.length === 0) continue;
    console.log(
      `  ${presetId}: ${procent(prPreset.filter((k) => k.bestaaet).length / prPreset.length)} (${prPreset.length} kørsler)`,
    );
  }

  console.log(`\nTærskel-kalibrering (pass-rate ved kandidat-tærskler; værdier over ${cfg.troskabsTaerskel} er konservative):`);
  for (let t = 0.5; t <= 0.9001; t += 0.05) {
    const afrundet = Math.round(t * 100) / 100;
    console.log(`  ≥ ${afrundet.toFixed(2)}: ${procent(passRateVed(gyldige, afrundet))}`);
  }

  const udMappe = path.join("data", "gate1");
  await mkdir(udMappe, { recursive: true });
  const stempel = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const udFil = path.join(udMappe, `resultat-${stempel}${mock ? "-MOCK" : ""}.json`);
  await writeFile(
    udFil,
    JSON.stringify({ mock, taerskel: cfg.troskabsTaerskel, passRate, totalCost, koersler }, null, 1),
    "utf8",
  );
  console.log(`\nDetaljer gemt i ${udFil}`);
  if (!mock) {
    console.log("Husk: skriv pass-raten ind i STATUS.md og kalibrér pipeline.troskabsTaerskel (S12 trin 1–2).");
  }
}

koer().catch((fejl) => {
  console.error("Gate 1-målingen fejlede:", fejl instanceof Error ? fejl.message : fejl);
  process.exitCode = 1;
});
