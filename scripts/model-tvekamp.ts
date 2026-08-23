// Model-tvekamp: SAMME foto, SAMME prompt, flere modeller — side om side.
// Formålet er ejerens spørgsmål efter modelvalget i admin (23/8): "er det
// faktisk noget?" Det er øjet der dømmer her, ikke en score — derfor ingen
// troskabs-tjek, ingen preset_stats, ingen DeepSeek. Bare billeder ved siden
// af hinanden og den MÅLTE pris pr. model.
//
// Gate 1 (scripts/gate1-fidelity-test.ts) er stadig den formelle dom med
// pass-rate og 2 reference-vægte. Denne her er den hurtige "kan modellen
// overhovedet holde tøjet?"-test på 1-3 prompts.
//
//   npx tsx scripts/model-tvekamp.ts <foto.jpg|mappe> \
//     [--modeller gemini-pro,flux-2-pro] \
//     [--presets lys-minimalisme,hyggelig-stue] \
//     [--ud <mappe>]
//
// Kræver nøglen til hver valgt models leverandør: GEMINI_API_KEY og/eller
// FAL_KEY. Der kaldes RIGTIGE modeller — hvert felt i arket koster penge.
// --mock kører uden nøgler og uden kald (tjekker kun at arket bygges).

import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { billedModeller, hentBilledModel, pipeline as cfg } from "../lib/config";
import { PRESETS, bygOnModelPrompt, hentPreset } from "../lib/pipeline/presets";
import { opretImageProvider } from "../lib/providers";
import type { BilledModel } from "../lib/config";

const BILLED_ENDELSER = [".jpg", ".jpeg", ".png", ".webp"];
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const STANDARD_MODELLER = ["gemini-pro", "flux-2-pro"];

type Felt = {
  foto: string;
  model: BilledModel;
  presetId: string;
  prompt: string;
  /** Filnavn i ud-mappen, eller null hvis kaldet fejlede */
  fil: string | null;
  fejl: string | null;
  costDkk: number;
  sekunder: number;
};

function fejlOgAfslut(besked: string): never {
  console.error(besked);
  process.exit(1);
}

function flag(navn: string): string | null {
  const i = process.argv.indexOf(navn);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : null;
}

function kr(beloeb: number): string {
  return `${beloeb.toFixed(2).replace(".", ",")} kr.`;
}

function escapeHtml(tekst: string): string {
  return tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dataUrl(sti: string): string {
  const mime = MIME[extname(sti).toLowerCase()] ?? "image/jpeg";
  return `data:${mime};base64,${readFileSync(sti).toString("base64")}`;
}

/** Provider-output er enten data-URL (Gemini) eller http-URL (fal) */
async function hentBytes(url: string): Promise<{ bytes: Buffer; endelse: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
    if (!match) throw new Error("ugyldig data-URL fra provider");
    return {
      bytes: Buffer.from(match[2]!, "base64"),
      endelse: match[1] === "image/png" ? ".png" : ".jpg",
    };
  }
  const svar = await fetch(url);
  if (!svar.ok) throw new Error(`kunne ikke hente output (HTTP ${svar.status})`);
  const type = svar.headers.get("content-type") ?? "image/jpeg";
  return {
    bytes: Buffer.from(await svar.arrayBuffer()),
    endelse: type.includes("png") ? ".png" : ".jpg",
  };
}

function vaelgModeller(): BilledModel[] {
  const ids = (flag("--modeller") ?? STANDARD_MODELLER.join(",")).split(",");
  return ids.map((raa) => {
    const model = hentBilledModel(raa.trim());
    if (!model) {
      fejlOgAfslut(
        `Ukendt model "${raa.trim()}". Kataloget: ${billedModeller.map((m) => m.id).join(", ")}`,
      );
    }
    return model;
  });
}

function vaelgPresets(): string[] {
  const valgt = flag("--presets");
  if (!valgt) return [PRESETS[0]!.id];
  return valgt.split(",").map((raa) => hentPreset(raa.trim()).id);
}

function bygArk(felter: Felt[], fotos: string[], modeller: BilledModel[]): string {
  const opsummering = modeller
    .map((model) => {
      const mine = felter.filter((f) => f.model.id === model.id);
      const ok = mine.filter((f) => f.fil);
      const cost = mine.reduce((sum, f) => sum + f.costDkk, 0);
      const sek = ok.length
        ? ok.reduce((sum, f) => sum + f.sekunder, 0) / ok.length
        : null;
      return `<tr><td>${escapeHtml(model.navn)}</td><td>${ok.length}/${mine.length}</td><td>${kr(
        cost,
      )}</td><td>${ok.length ? kr(cost / ok.length) : "—"}</td><td>${
        sek === null ? "—" : `${sek.toFixed(0)} s`
      }</td><td>${escapeHtml(model.vandmaerke)}</td></tr>`;
    })
    .join("\n");

  const sektioner = fotos
    .map((foto) => {
      const raekker = felter.filter((f) => f.foto === foto);
      const presets = [...new Set(raekker.map((f) => f.presetId))];
      const blokke = presets
        .map((presetId) => {
          const celler = modeller
            .map((model) => {
              const felt = raekker.find(
                (f) => f.model.id === model.id && f.presetId === presetId,
              );
              const indhold = felt?.fil
                ? `<img src="${escapeHtml(felt.fil)}" alt="${escapeHtml(model.navn)}">`
                : `<p class="fejl">${escapeHtml(felt?.fejl ?? "ikke kørt")}</p>`;
              return `<figure>
        <figcaption>${escapeHtml(model.navn)} · ${
          felt ? kr(felt.costDkk) : "—"
        } · ${felt?.sekunder ? `${felt.sekunder.toFixed(0)} s` : "—"}</figcaption>
        ${indhold}
      </figure>`;
            })
            .join("\n");
          const prompt = raekker.find((f) => f.presetId === presetId)?.prompt ?? "";
          return `<div class="preset">
      <h3>${escapeHtml(hentPreset(presetId).navn)}</h3>
      <details><summary>prompt</summary><pre>${escapeHtml(prompt)}</pre></details>
      <div class="grid">
        <figure><figcaption>ORIGINAL (reference)</figcaption><img src="${escapeHtml(
          dataUrl(foto),
        )}" alt="original"></figure>
        ${celler}
      </div>
    </div>`;
        })
        .join("\n");
      return `<section><h2>${escapeHtml(basename(foto))}</h2>${blokke}</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="da"><head><meta charset="utf-8">
<title>Model-tvekamp</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
  h1 { font-size: 1.6rem; }
  table { border-collapse: collapse; margin: 1rem 0 2rem; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  section { border-top: 2px solid #1a1a1a; padding-top: 1rem; margin-top: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
  figure { margin: 0; }
  figcaption { font: 12px/1.4 ui-monospace, monospace; margin-bottom: 4px; color: #555; }
  img { width: 100%; border: 1px solid #ddd; }
  pre { white-space: pre-wrap; background: #f6f6f6; padding: 10px; font-size: 12px; }
  .fejl { color: #a00; font: 13px ui-monospace, monospace; }
  .preset { margin-bottom: 2rem; }
</style></head><body>
<h1>Model-tvekamp</h1>
<p>Samme foto, samme prompt, én kolonne pr. model. Spørgsmålet er kun ét:
<strong>er det STADIG det samme stykke tøj?</strong> Print, farve, snit, længde,
slid — kig efter det der ville gøre en køber sur.</p>
<table>
  <tr><th>model</th><th>leveret</th><th>målt cost</th><th>pr. billede</th><th>tid</th><th>vandmærke</th></tr>
  ${opsummering}
</table>
${sektioner}
</body></html>`;
}

async function main() {
  const indArg = process.argv[2];
  if (!indArg || indArg.startsWith("--")) {
    fejlOgAfslut(
      "Brug: npx tsx scripts/model-tvekamp.ts <foto.jpg|mappe> [--modeller a,b] [--presets a,b] [--ud mappe]",
    );
  }
  const ind = resolve(indArg);
  let fotos: string[];
  try {
    fotos = statSync(ind).isDirectory()
      ? readdirSync(ind)
          .filter((f) => BILLED_ENDELSER.includes(extname(f).toLowerCase()))
          .sort()
          .map((f) => join(ind, f))
      : [ind];
  } catch {
    fejlOgAfslut(`Findes ikke: ${ind}`);
  }
  if (fotos.length === 0) fejlOgAfslut(`Ingen billeder i ${ind}`);

  const modeller = vaelgModeller();
  const presets = vaelgPresets();
  const udMappe = resolve(flag("--ud") ?? "tvekamp-ud");
  mkdirSync(udMappe, { recursive: true });

  console.log(
    `Tvekamp: ${fotos.length} foto(s) × ${modeller.length} modeller × ${presets.length} preset(s) = ${
      fotos.length * modeller.length * presets.length
    } billeder`,
  );
  console.log(`Skøn: ${kr(
    fotos.length *
      presets.length *
      modeller.reduce((sum, m) => sum + m.costDkk, 0),
  )}\n`);

  const mock = process.argv.includes("--mock");
  const providere = new Map(
    await Promise.all(
      modeller.map(async (m) => {
        if (mock) {
          const { MockImageProvider } = await import("../lib/providers/mock");
          return [m.id, new MockImageProvider({ onModelCostDkk: m.costDkk })] as const;
        }
        return [m.id, await opretImageProvider(m)] as const;
      }),
    ),
  );

  const felter: Felt[] = [];
  for (const foto of fotos) {
    const reference = dataUrl(foto);
    for (const presetId of presets) {
      const prompt = bygOnModelPrompt(hentPreset(presetId), basename(foto));
      // Modellerne kører parallelt på samme prompt — det er hele pointen
      const runde = await Promise.all(
        modeller.map(async (model): Promise<Felt> => {
          const start = Date.now();
          const grund: Omit<Felt, "fil" | "fejl" | "costDkk" | "sekunder"> = {
            foto,
            model,
            presetId,
            prompt,
          };
          try {
            const svar = await providere.get(model.id)!.genererOnModel({
              referenceUrl: reference,
              prompt,
              referenceVaegt: cfg.normalReferenceVaegt,
            });
            const { bytes, endelse } = await hentBytes(svar.url);
            const filnavn = `${basename(foto, extname(foto))}--${presetId}--${model.id}${endelse}`;
            writeFileSync(join(udMappe, filnavn), bytes);
            const sekunder = (Date.now() - start) / 1000;
            console.log(
              `  ✓ ${basename(foto)} · ${presetId} · ${model.id} · ${kr(
                svar.costDkk,
              )} · ${sekunder.toFixed(0)} s`,
            );
            return {
              ...grund,
              fil: filnavn,
              fejl: null,
              costDkk: svar.costDkk,
              sekunder,
            };
          } catch (fejl) {
            const tekst = String(fejl).slice(0, 300);
            console.log(`  ✗ ${basename(foto)} · ${presetId} · ${model.id} · ${tekst}`);
            return {
              ...grund,
              fil: null,
              fejl: tekst,
              costDkk: 0,
              sekunder: (Date.now() - start) / 1000,
            };
          }
        }),
      );
      felter.push(...runde);
    }
  }

  const arkSti = join(udMappe, "tvekamp.html");
  writeFileSync(arkSti, bygArk(felter, fotos, modeller));

  console.log("\nMålt cost:");
  for (const model of modeller) {
    const mine = felter.filter((f) => f.model.id === model.id);
    const cost = mine.reduce((sum, f) => sum + f.costDkk, 0);
    const ok = mine.filter((f) => f.fil).length;
    console.log(`  ${model.navn}: ${ok}/${mine.length} leveret · ${kr(cost)}`);
  }
  console.log(`\nArk: ${arkSti}`);
}

main().catch((fejl) => fejlOgAfslut(String(fejl)));
