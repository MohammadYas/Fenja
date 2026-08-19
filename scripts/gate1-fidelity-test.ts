// Gate 1 (SPEC §12, HANDOFF §6.4): troskabs-eksperimentet. Ejer-beslutning
// 2026-08-19: kun Gemini — TVEKAMP mellem Nano Banana Pro (gemini final) og
// Nano Banana (gemini preview), × alle presets × 2 reference-styrker.
// Troskabs-scores skrives til preset_stats med provider-dimension via
// PresetStatsStore, og rapporten viser pass-rate OG målt cost pr. billede
// side om side pr. provider. Manuel scoring pr. billede er stadig dommen
// (Gate 1: ≥ 70 % troskab for mindst ét preset).
//
// Kørsel uden nøgler (mock-providers, deterministiske scores):
//   npx tsx scripts/gate1-fidelity-test.ts <mappe-med-toejfotos>
// Mod rigtige providers — KUN ejeren, kræver GEMINI_API_KEY +
// DEEPSEEK_API_KEY (og Supabase-env hvis stats skal i databasen):
//   npx tsx scripts/gate1-fidelity-test.ts <mappe-med-toejfotos> --live
// Valgfrit: --ud <sti.html> (default: <mappe>/gate1-rapport.html)

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { billedProvidere, pipeline as cfg } from "../lib/config";
import {
  MockPresetStatsStore,
  PRESETS,
  SupabasePresetStatsStore,
  bygOnModelPrompt,
  passRate,
  presetVersionsTag,
  type Preset,
  type PresetStatsStore,
} from "../lib/pipeline/presets";
import type { ImageProvider } from "../lib/providers/image";
import { MockImageProvider, MockTextProvider } from "../lib/providers/mock";
import type { TextProvider } from "../lib/providers/text";

const BILLED_ENDELSER = [".jpg", ".jpeg", ".png", ".webp"];
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** En deltager i tvekampen; id er provider-dimensionen i preset_stats */
type Deltager = {
  id: string;
  navn: string;
  image: ImageProvider;
};

type Koersel = {
  foto: string;
  deltager: Deltager;
  preset: Preset;
  referenceVaegt: number;
  /** null når genereringen fejlede hos provideren */
  genereretUrl: string | null;
  costDkk: number | null;
  score: number | null;
  bestaaet: boolean | null;
  begrundelse: string;
};

function fejlOgAfslut(besked: string): never {
  console.error(besked);
  process.exit(1);
}

/** Deterministisk mock-score 0,55–0,94 — varierer omkring tærsklen, ingen Math.random */
function mockScore(noegle: string): number {
  let hash = 0;
  for (const tegn of noegle) hash = (hash * 31 + tegn.charCodeAt(0)) | 0;
  return Math.round((0.55 + (Math.abs(hash) % 40) / 100) * 100) / 100;
}

function tilDataUrl(sti: string): string {
  const mime = MIME[extname(sti).toLowerCase()] ?? "image/jpeg";
  return `data:${mime};base64,${readFileSync(sti).toString("base64")}`;
}

function escapeHtml(tekst: string): string {
  return tekst
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function kr(beloeb: number): string {
  return `${beloeb.toFixed(2).replace(".", ",")} kr.`;
}

async function opretDeltagere(live: boolean): Promise<Deltager[]> {
  const { gemini } = billedProvidere;
  if (!live) {
    // Mock spejler hver providers cost-skøn, så cost-kolonnen er meningsfuld
    return [
      {
        id: "gemini-final",
        navn: `Nano Banana Pro (${gemini.final.model})`,
        image: new MockImageProvider({ onModelCostDkk: gemini.final.costDkk }),
      },
      {
        id: "gemini-preview",
        navn: `Nano Banana (${gemini.preview.model})`,
        image: new MockImageProvider({ onModelCostDkk: gemini.preview.costDkk }),
      },
    ];
  }
  const { GeminiImageProvider } = await import("../lib/providers/gemini");
  return [
    {
      id: "gemini-final",
      navn: `Nano Banana Pro (${gemini.final.model})`,
      image: new GeminiImageProvider(gemini.final),
    },
    {
      id: "gemini-preview",
      navn: `Nano Banana (${gemini.preview.model})`,
      image: new GeminiImageProvider(gemini.preview),
    },
  ];
}

async function opretTekstProvider(
  live: boolean,
): Promise<(noegle: string) => TextProvider> {
  if (!live) {
    // Én mock-tekstprovider pr. kørsel, så scoren er deterministisk pr. kombination
    return (noegle) => new MockTextProvider({ troskabsScore: mockScore(noegle) });
  }
  const { DeepSeekTextProvider } = await import("../lib/providers/deepseek");
  const tekst = new DeepSeekTextProvider();
  return () => tekst;
}

async function opretStatsStore(live: boolean): Promise<PresetStatsStore> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (live && url && serviceKey) {
    const { createClient } = await import("@supabase/supabase-js");
    return new SupabasePresetStatsStore(createClient(url, serviceKey));
  }
  return new MockPresetStatsStore();
}

/** Målt cost og model-pass-rate pr. deltager — side om side i rapporten */
function providerOpsummering(deltagere: Deltager[], koersler: Koersel[]) {
  return deltagere.map((d) => {
    const egne = koersler.filter((k) => k.deltager.id === d.id);
    const genererede = egne.filter((k) => k.costDkk !== null);
    const bedoemte = egne.filter((k) => k.bestaaet !== null);
    const passes = bedoemte.filter((k) => k.bestaaet).length;
    const sumCost = genererede.reduce((sum, k) => sum + (k.costDkk ?? 0), 0);
    return {
      deltager: d,
      billeder: genererede.length,
      costPrBillede: genererede.length ? sumCost / genererede.length : null,
      runs: bedoemte.length,
      passes,
      passRate: bedoemte.length ? passes / bedoemte.length : null,
    };
  });
}

function kortCelle(koersel: Koersel, indeks: number): string {
  const navn = `k${indeks}`;
  const vaegtTekst = koersel.referenceVaegt.toFixed(2).replace(".", ",");
  const visesSomBillede =
    koersel.genereretUrl !== null &&
    (koersel.genereretUrl.startsWith("http") ||
      koersel.genereretUrl.startsWith("data:"));
  const billede = visesSomBillede
    ? `<img src="${escapeHtml(koersel.genereretUrl!)}" alt="Genereret: ${escapeHtml(koersel.preset.navn)}" loading="lazy">`
    : `<div class="pladsholder">${
        koersel.genereretUrl
          ? `mock-output<br><code>${escapeHtml(koersel.genereretUrl)}</code>`
          : "generering fejlede"
      }</div>`;
  const scoreTekst =
    koersel.score === null
      ? `<span class="score fejl">ingen score</span>`
      : `<span class="score ${koersel.bestaaet ? "pass" : "fail"}">model: ${koersel.score
          .toFixed(2)
          .replace(".", ",")} (${koersel.bestaaet ? "over" : "under"} tærskel)</span>`;
  return `<div class="kort" data-preset="${escapeHtml(koersel.preset.id)}" data-provider="${escapeHtml(koersel.deltager.id)}">
    <h4>${escapeHtml(koersel.preset.navn)} · vægt ${vaegtTekst}</h4>
    ${billede}
    ${scoreTekst}
    <fieldset>
      <legend>Manuel troskab</legend>
      <label><input type="radio" name="${navn}" value="ok"> OK</label>
      <label><input type="radio" name="${navn}" value="nej"> Ikke OK</label>
    </fieldset>
    <input type="text" class="note" placeholder="note (print/farve/snit …)">
  </div>`;
}

function bygRapport(args: {
  mappe: string;
  live: boolean;
  fotos: string[];
  deltagere: Deltager[];
  koersler: Koersel[];
  statistik: {
    provider: string;
    tag: string;
    runs: number;
    passes: number;
    avg: number | null;
  }[];
}): string {
  const promptEksempler = PRESETS.map(
    (p) => `<details><summary>${escapeHtml(p.navn)} (${escapeHtml(
      presetVersionsTag(p),
    )})</summary><pre>${escapeHtml(bygOnModelPrompt(p, args.fotos[0] ?? "eksempel"))}</pre></details>`,
  ).join("\n");

  const opsummering = providerOpsummering(args.deltagere, args.koersler);
  const providerRaekker = opsummering
    .map(
      (o) =>
        `<tr><td>${escapeHtml(o.deltager.navn)}</td><td>${o.billeder}</td><td>${
          o.costPrBillede === null ? "—" : kr(o.costPrBillede)
        }</td><td>${o.runs}</td><td>${o.passes}</td><td>${
          o.passRate === null ? "—" : `${Math.round(o.passRate * 100)} %`
        }</td></tr>`,
    )
    .join("\n");

  const statRaekker = args.statistik
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.provider)}</td><td>${escapeHtml(s.tag)}</td><td>${s.runs}</td><td>${s.passes}</td><td>${
          s.avg === null ? "—" : s.avg.toFixed(3).replace(".", ",")
        }</td><td>${((s.passes / Math.max(s.runs, 1)) * 100).toFixed(0)} %</td></tr>`,
    )
    .join("\n");

  let indeks = 0;
  const sektioner = args.fotos
    .map((foto) => {
      const grupper = args.deltagere
        .map((d) => {
          const rows = args.koersler.filter(
            (k) => k.foto === foto && k.deltager.id === d.id,
          );
          const celler = rows.map((k) => kortCelle(k, indeks++)).join("\n");
          return `<div class="provider-gruppe">
      <h4 class="provider-navn">${escapeHtml(d.navn)}</h4>
      <div class="grid">${celler}</div>
    </div>`;
        })
        .join("\n");
      return `<section class="foto">
  <h3>${escapeHtml(foto)}</h3>
  <div class="raekke">
    <figure class="reference">
      <img src="${escapeHtml(foto)}" alt="Reference: ${escapeHtml(foto)}" loading="lazy">
      <figcaption>ægte foto (reference)</figcaption>
    </figure>
    <div class="grupper">${grupper}</div>
  </div>
</section>`;
    })
    .join("\n");

  const presetJson = JSON.stringify(
    PRESETS.map((p) => ({ id: p.id, navn: p.navn })),
  );
  const deltagerJson = JSON.stringify(
    args.deltagere.map((d) => ({ id: d.id, navn: d.navn })),
  );

  return `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gate 1 · troskabs-tvekamp</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #212523; background: #f1f3f2; }
  h1 { font-size: 1.5rem; } h3 { margin: 0 0 .5rem; }
  .meta, table { font-size: .9rem; }
  table { border-collapse: collapse; margin: .5rem 0 1.5rem; }
  td, th { border: 1px solid #d8d3c6; padding: .3rem .6rem; text-align: left; }
  section.foto { border-top: 1px solid #d8d3c6; padding: 1rem 0; }
  .raekke { display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
  .reference { margin: 0; max-width: 220px; }
  .reference img, .kort img { max-width: 100%; border-radius: 4px; display: block; }
  figcaption { font-size: .8rem; color: #55605a; }
  .grupper { flex: 1; display: flex; flex-direction: column; gap: .75rem; min-width: 280px; }
  .provider-navn { margin: 0 0 .35rem; font-size: .85rem; color: #24513f; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .75rem; }
  .kort { border: 1px solid #d8d3c6; border-radius: 6px; padding: .6rem; background: #fff; }
  .kort h4 { margin: 0 0 .4rem; font-size: .85rem; }
  .pladsholder { background: #e6e8e7; border-radius: 4px; padding: 1.2rem .6rem; font-size: .75rem; color: #55605a; word-break: break-all; }
  .score { display: inline-block; margin: .4rem 0; font-size: .8rem; padding: .1rem .4rem; border-radius: 3px; }
  .score.pass { background: #dcebe2; color: #24513f; }
  .score.fail, .score.fejl { background: #f3e0d4; color: #8a4a12; }
  fieldset { border: none; padding: 0; margin: .3rem 0; font-size: .85rem; }
  legend { font-size: .75rem; color: #55605a; }
  .note { width: 100%; box-sizing: border-box; font-size: .8rem; padding: .25rem; border: 1px solid #d8d3c6; border-radius: 3px; }
  #manuel { position: sticky; top: 0; background: #fff; border: 1px solid #d8d3c6; border-radius: 6px; padding: .6rem 1rem; margin: 1rem 0; }
  #manuel strong.gate-ok { color: #24513f; }
  pre { white-space: pre-wrap; background: #fff; border: 1px solid #d8d3c6; padding: .6rem; font-size: .8rem; }
</style>
</head>
<body>
<h1>Gate 1 · troskabs-tvekamp</h1>
<p class="meta">Mappe: <code>${escapeHtml(args.mappe)}</code> · tilstand: <strong>${
    args.live ? "live" : "mock"
  }</strong> · ${args.fotos.length} fotos × ${args.deltagere.length} providers × ${
    PRESETS.length
  } presets × 2 reference-styrker
(${cfg.normalReferenceVaegt.toFixed(2).replace(".", ",")} / ${cfg.strammereReferenceVaegt
    .toFixed(2)
    .replace(".", ",")}) · model-tærskel ${cfg.troskabsTaerskel.toFixed(2).replace(".", ",")}.
Gate 1 består når mindst ét preset når ≥ 70 % manuel troskab (SPEC §12).</p>

<h2>Providere side om side (målt cost pr. billede + model-pass-rate)</h2>
<table>
<tr><th>provider</th><th>billeder</th><th>målt cost pr. billede</th><th>runs</th><th>passes</th><th>pass-rate</th></tr>
${providerRaekker}
</table>

<h2>Modelscores pr. (provider, preset-version) — skrevet til preset_stats</h2>
<table>
<tr><th>provider</th><th>preset@version</th><th>runs</th><th>passes</th><th>avg_fidelity</th><th>pass-rate</th></tr>
${statRaekker}
</table>

<h2>Kompilerede prompts (alle 5 blokke)</h2>
${promptEksempler}

<div id="manuel">Manuel pass-rate: <span id="manuel-status">udfyld felterne under hvert billede</span></div>

${sektioner}

<script>
  const PRESETS = ${presetJson};
  const DELTAGERE = ${deltagerJson};
  function opdater() {
    const dele = [];
    let bedste = 0;
    for (const d of DELTAGERE) {
      const presetDele = [];
      for (const p of PRESETS) {
        const kort = [...document.querySelectorAll('.kort[data-preset="' + p.id + '"][data-provider="' + d.id + '"]')];
        const svar = kort.map((k) => k.querySelector('input[type=radio]:checked'));
        const besvarede = svar.filter(Boolean);
        const ok = besvarede.filter((r) => r.value === 'ok').length;
        const rate = besvarede.length ? ok / besvarede.length : null;
        if (rate !== null) bedste = Math.max(bedste, rate);
        presetDele.push(p.navn + ' ' + (rate === null ? '—' : Math.round(rate * 100) + ' % (' + besvarede.length + '/' + kort.length + ')'));
      }
      dele.push('<strong>' + d.navn + '</strong>: ' + presetDele.join(' · '));
    }
    const gate = bedste >= 0.7 ? ' — <strong class="gate-ok">Gate 1: bestået med bedste (provider, preset)</strong>' : '';
    document.getElementById('manuel-status').innerHTML = dele.join('<br>') + gate;
  }
  document.addEventListener('change', opdater);
</script>
</body>
</html>
`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const udIndeks = args.indexOf("--ud");
  const udArg = udIndeks >= 0 ? args[udIndeks + 1] : undefined;
  const mappeArg = args.find(
    (a, i) => !a.startsWith("--") && (udIndeks < 0 || i !== udIndeks + 1),
  );
  if (!mappeArg) {
    fejlOgAfslut(
      "Brug: npx tsx scripts/gate1-fidelity-test.ts <mappe-med-toejfotos> [--live] [--ud rapport.html]",
    );
  }

  const mappe = resolve(mappeArg);
  let erMappe = false;
  try {
    erMappe = statSync(mappe).isDirectory();
  } catch {
    // findes ikke
  }
  if (!erMappe) fejlOgAfslut(`Mappen findes ikke: ${mappe}`);

  const fotos = readdirSync(mappe)
    .filter((f) => BILLED_ENDELSER.includes(extname(f).toLowerCase()))
    .sort();
  if (fotos.length === 0) {
    fejlOgAfslut(`Ingen tøjfotos (${BILLED_ENDELSER.join("/")}) i ${mappe}`);
  }

  const deltagere = await opretDeltagere(live);
  const tekstForKoersel = await opretTekstProvider(live);
  const stats = await opretStatsStore(live);
  const vaegte = [cfg.normalReferenceVaegt, cfg.strammereReferenceVaegt];
  const koersler: Koersel[] = [];

  console.log(
    `Gate 1-tvekamp: ${fotos.length} fotos × ${deltagere.length} providers × ${
      PRESETS.length
    } presets × ${vaegte.length} vægte (${live ? "LIVE" : "mock"})`,
  );

  for (const foto of fotos) {
    // Live: providere skal bruge en URL de kan hente — lokale filer sendes som data-URL
    const referenceUrl = live ? tilDataUrl(join(mappe, foto)) : foto;
    for (const deltager of deltagere) {
      for (const preset of PRESETS) {
        // Fotoets filnavn er rotationsnøglen, så personvalget er stabilt pr. foto
        const prompt = bygOnModelPrompt(preset, foto);
        for (const vaegt of vaegte) {
          const noegle = `${foto}|${deltager.id}|${presetVersionsTag(preset)}|${vaegt}`;
          let koersel: Koersel;
          try {
            const genereret = await deltager.image.genererOnModel({
              referenceUrl,
              prompt,
              referenceVaegt: vaegt,
            });
            const vurdering = await tekstForKoersel(noegle).vurderTroskab({
              aegteUrl: referenceUrl,
              genereretUrl: genereret.url,
            });
            const bestaaet = vurdering.score >= cfg.troskabsTaerskel;
            await stats.registrerKoersel({
              presetId: preset.id,
              version: preset.version,
              provider: deltager.id,
              bestaaet,
              fidelityScore: vurdering.score,
            });
            koersel = {
              foto,
              deltager,
              preset,
              referenceVaegt: vaegt,
              genereretUrl: genereret.url,
              costDkk: genereret.costDkk,
              score: vurdering.score,
              bestaaet,
              begrundelse: vurdering.begrundelse,
            };
          } catch (fejl) {
            koersel = {
              foto,
              deltager,
              preset,
              referenceVaegt: vaegt,
              genereretUrl: null,
              costDkk: null,
              score: null,
              bestaaet: null,
              begrundelse: fejl instanceof Error ? fejl.message : String(fejl),
            };
          }
          koersler.push(koersel);
          console.log(
            `  ${foto} · ${deltager.id} · ${preset.id} · vægt ${vaegt}: ${
              koersel.score === null
                ? `FEJL (${koersel.begrundelse})`
                : `${koersel.score.toFixed(2)} ${koersel.bestaaet ? "pass" : "fail"}`
            }`,
          );
        }
      }
    }
  }

  const statistik = (await stats.hentStatistik()).map((r) => ({
    provider: r.provider,
    tag: `${r.presetId}@v${r.version}`,
    runs: r.runs,
    passes: r.passes,
    avg: r.avgFidelity,
  }));

  console.log("\nProvidere side om side:");
  for (const o of providerOpsummering(deltagere, koersler)) {
    console.log(
      `  ${o.deltager.navn}: billeder=${o.billeder} cost/billede=${
        o.costPrBillede === null ? "—" : kr(o.costPrBillede)
      } runs=${o.runs} passes=${o.passes} pass-rate=${
        o.passRate === null ? "—" : `${Math.round(o.passRate * 100)} %`
      }`,
    );
  }

  console.log("\npreset_stats (med provider-dimension):");
  for (const raekke of await stats.hentStatistik()) {
    const rate = passRate(raekke);
    console.log(
      `  ${raekke.provider} · ${raekke.presetId}@v${raekke.version}: runs=${raekke.runs} ` +
        `passes=${raekke.passes} avg_fidelity=${raekke.avgFidelity ?? "—"} pass-rate=${
          rate === null ? "—" : `${Math.round(rate * 100)} %`
        }`,
    );
  }

  const udSti = udArg ? resolve(udArg) : join(mappe, "gate1-rapport.html");
  writeFileSync(
    udSti,
    bygRapport({ mappe, live, fotos, deltagere, koersler, statistik }),
    "utf8",
  );
  console.log(`\nRapport skrevet til: ${udSti}`);
  console.log(
    "Åbn rapporten i en browser og bedøm hvert billede manuelt — Gate 1 kræver ≥ 70 % for mindst ét preset.",
  );
}

main().catch((fejl: unknown) => {
  console.error(fejl);
  process.exit(1);
});
