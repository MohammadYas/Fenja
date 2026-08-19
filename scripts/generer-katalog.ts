// Generér katalog-/marketingbilleder med Gemini (ejer-ordre 2026-08-19).
// 1 billede = 1 kald = 1 credit — scriptet tæller og rapporterer PRÆCIST
// antal genererede billeder, så ejeren kan beregne cost pr. billede.
//
// Brug:
//   npx tsx scripts/generer-katalog.ts --liste                 # se alle prompt-id'er
//   npx tsx scripts/generer-katalog.ts --alle                  # 1 billede pr. prompt
//   npx tsx scripts/generer-katalog.ts p4-sovevaerelse-kjole --antal 3
//   npx tsx scripts/generer-katalog.ts kjole-gulv jeans-stativ --antal 2
// Valgfrit: --ud <mappe> (default public/eksempler/katalog) --model <id>
//
// Kræver GEMINI_API_KEY i miljøet. Billeder gemmes som <id>-<n>.png.

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

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--liste")) {
    for (const p of KATALOG_PROMPTS) console.log(`${p.id}  —  ${p.titel}`);
    console.log(`\n${KATALOG_PROMPTS.length} prompts i alt.`);
    return;
  }

  const noegle = process.env.GEMINI_API_KEY;
  if (!noegle) {
    console.error("GEMINI_API_KEY mangler i miljøet.");
    process.exit(1);
  }

  const antalIndeks = args.indexOf("--antal");
  const antal = antalIndeks >= 0 ? Number(args[antalIndeks + 1]) : 1;
  const udIndeks = args.indexOf("--ud");
  const ud = resolve(udIndeks >= 0 ? args[udIndeks + 1]! : "public/eksempler/katalog");
  const modelIndeks = args.indexOf("--model");
  const model = modelIndeks >= 0 ? args[modelIndeks + 1]! : MODEL;

  const flagVaerdier = new Set(
    [antalIndeks, udIndeks, modelIndeks].filter((i) => i >= 0).map((i) => i + 1),
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
        const png = await generer(p.prompt, noegle, model);
        writeFileSync(fil, png);
        ok++;
        console.log(`  OK   ${p.id}-${n}.png (${Math.round(png.length / 1024)} KB)`);
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
