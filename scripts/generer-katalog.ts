// Generér katalog-/marketingbilleder fra prompts i katalog-prompts-data.
// Kan køre på BÅDE Gemini og fal (ejer-ordre 23/8: samme prompt, forskellig
// model — så forsideserien kan laves om uden SynthID, og så vi kan se om en
// fal-model rammer forsidens stil).
// 1 billede = 1 kald = 1 credit — scriptet tæller og rapporterer PRÆCIST
// antal genererede billeder, så ejeren kan beregne cost pr. billede.
//
// Brug:
//   npx tsx scripts/generer-katalog.ts --liste                 # se alle prompt-id'er
//   npx tsx scripts/generer-katalog.ts --alle                  # 1 billede pr. prompt
//   npx tsx scripts/generer-katalog.ts p4-sovevaerelse-kjole --antal 3
//   npx tsx scripts/generer-katalog.ts kjole-gulv jeans-stativ --antal 2
//   npx tsx scripts/generer-katalog.ts p15-efter-spejl-strik --model fal-ai/flux-2-pro
// Valgfrit: --ud <mappe> (default public/eksempler/katalog) --model <id>
//   --ekstra '{"aspect_ratio":"2:3"}'  (model-specifikke felter til fal)
//
// Modellen afgør leverandøren: "gemini-…" kalder Google (kræver
// GEMINI_API_KEY), alt andet er et fal-endpoint (kræver FAL_KEY).
// Billeder gemmes som <id>-<n>.png.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { KATALOG_PROMPTS } from "./katalog-prompts-data";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-3-pro-image-preview"; // samme som billedProvidere.final

type GeminiSvar = {
  candidates?: {
    content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
  }[];
  error?: { message?: string };
};

async function generer(prompt: string, noegle: string, model: string): Promise<Buffer> {
  const svar = await fetch(`${API_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": noegle, "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio: "2:3" },
      },
    }),
  });
  if (!svar.ok) {
    const tekst = (await svar.text()).slice(0, 400);
    throw new Error(`HTTP ${svar.status} — ${tekst}`);
  }
  const data = (await svar.json()) as GeminiSvar;
  const billede = data.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data,
  )?.inlineData;
  if (!billede?.data) throw new Error("intet billede i svaret");
  return Buffer.from(billede.data, "base64");
}

/**
 * fal's tekst-til-billede. Endpointsene deler ikke skema: nogle tager
 * image_size som objekt, andre kun som enum, og ikke alle kender
 * output_format. Derfor prøves den fulde form først, og falder vi på et
 * validerings-svar, gentages kaldet med bare prompten — så en ny model kan
 * afprøves uden at dens skema skal slås op først.
 */
async function genererFal(
  prompt: string,
  model: string,
  ekstra: Record<string, unknown>,
): Promise<Buffer> {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: process.env.FAL_KEY! });

  const kald = async (input: Record<string, unknown>) => {
    const resultat = await fal.subscribe(model, { input });
    const data = resultat.data as { images?: { url?: string }[]; image?: { url?: string } };
    const url = data.images?.[0]?.url ?? data.image?.url;
    if (!url) throw new Error("intet billede i fal-svaret");
    return url;
  };

  let url: string;
  try {
    // 2:3 som Gemini-grenen
    url = await kald({
      prompt,
      image_size: { width: 1024, height: 1536 },
      output_format: "jpeg",
      ...ekstra,
    });
  } catch (fejl) {
    if (!/422|validation|unprocessable|unknown field/i.test(String(fejl))) throw fejl;
    console.log(`       (${model} afviste de valgfrie felter — prøver igen med bare prompten)`);
    url = await kald({ prompt, ...ekstra });
  }

  const svar = await fetch(url);
  if (!svar.ok) throw new Error(`kunne ikke hente output (HTTP ${svar.status})`);
  return Buffer.from(await svar.arrayBuffer());
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--liste")) {
    for (const p of KATALOG_PROMPTS) console.log(`${p.id}  —  ${p.titel}`);
    console.log(`\n${KATALOG_PROMPTS.length} prompts i alt.`);
    return;
  }

  const antalIndeks = args.indexOf("--antal");
  const antal = antalIndeks >= 0 ? Number(args[antalIndeks + 1]) : 1;
  const udIndeks = args.indexOf("--ud");
  const ud = resolve(udIndeks >= 0 ? args[udIndeks + 1]! : "public/eksempler/katalog");
  const ekstraIndeks = args.indexOf("--ekstra");
  // Model-specifikke felter som JSON, fx Grok's aspect_ratio:
  //   --ekstra '{"aspect_ratio":"2:3","resolution":"2k"}'
  const ekstra: Record<string, unknown> =
    ekstraIndeks >= 0 ? JSON.parse(args[ekstraIndeks + 1]!) : {};
  const modelIndeks = args.indexOf("--model");
  const model = modelIndeks >= 0 ? args[modelIndeks + 1]! : MODEL;
  // Gemini-modeller hedder "gemini-…"; ALT andet er et fal-endpoint. Vendt
  // om med vilje: fal's id'er har ikke ét fælles præfiks — de hedder både
  // "fal-ai/…", "openai/gpt-image-2", "xai/…" og "bytedance/…".
  const erFal = !model.startsWith("gemini");

  const noegle = process.env[erFal ? "FAL_KEY" : "GEMINI_API_KEY"];
  if (!noegle) {
    console.error(`${erFal ? "FAL_KEY" : "GEMINI_API_KEY"} mangler i miljøet.`);
    process.exit(1);
  }

  const flagVaerdier = new Set(
    [antalIndeks, udIndeks, modelIndeks, ekstraIndeks]
      .filter((i) => i >= 0)
      .map((i) => i + 1),
  );
  const idArgs = args.filter(
    (a, i) => !a.startsWith("--") && !flagVaerdier.has(i),
  );

  const valgte = args.includes("--alle")
    ? KATALOG_PROMPTS
    : KATALOG_PROMPTS.filter((p) => idArgs.includes(p.id));
  if (valgte.length === 0) {
    console.error("Ingen prompts valgt. Brug --alle, --liste eller angiv id'er.");
    process.exit(1);
  }
  if (!Number.isInteger(antal) || antal < 1) {
    console.error("--antal skal være et helt tal ≥ 1.");
    process.exit(1);
  }

  mkdirSync(ud, { recursive: true });
  console.log(
    `Genererer ${valgte.length} prompt(s) × ${antal} billede(r) = op til ${
      valgte.length * antal
    } kald mod ${model}.\nUd: ${ud}\n`,
  );

  let ok = 0;
  let fejl = 0;
  for (const p of valgte) {
    for (let n = 1; n <= antal; n++) {
      const fil = join(ud, `${p.id}-${n}.png`);
      try {
        const billede = erFal
          ? await genererFal(p.prompt, model, ekstra)
          : await generer(p.prompt, noegle, model);
        writeFileSync(fil, billede);
        ok++;
        console.log(`  OK   ${p.id}-${n}.png (${Math.round(billede.length / 1024)} KB)`);
      } catch (e) {
        fejl++;
        console.log(`  FEJL ${p.id}-${n}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  console.log(
    `\nFÆRDIG: ${ok} billede(r) genereret (= ${ok} credits), ${fejl} fejl.`,
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
