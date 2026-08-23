// fal.ai-implementering af ImageProvider. Kræver FAL_KEY — bruges aldrig i
// CI; tests kører mod mock (C-7). Model-id (fal-endpointet) og cost-skøn
// kommer ALTID fra kataloget i lib/config.ts via admin-valget — provideren
// hårdkoder aldrig en model, præcis som GeminiImageProvider.
//
// Alle understøttede endpoints er edit-modeller med samme inputform:
//   { prompt, image_urls, image_size } (+ model-specifikke ekstraInput)
// Det gælder fal-ai/flux-2-pro/edit, fal-ai/qwen-image-edit-plus og
// fal-ai/bytedance/seedream/v4.5/edit. Modeller med anden inputform må IKKE
// lægges i kataloget, før denne fil kan oversætte dem.

import { fal } from "@fal-ai/client";
import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";

// 2:3 ligger tæt på Vinteds visning — samme format som Gemini-provideren
const BILLED_STOERRELSE = { width: 1024, height: 1536 } as const;

export type FalOpsaetning = {
  /** fal-endpoint fra kataloget, fx "fal-ai/flux-2-pro/edit" */
  model: string;
  /** Skøn i kr. pr. genereret billede fra kataloget (G-1/NFR-11) */
  costDkk: number;
  /** Model-specifikke felter (output_format, num_images …) */
  ekstraInput?: Record<string, unknown>;
};

type FalBillede = { url?: string };

function foersteBillede(data: unknown): string {
  const d = data as { image?: FalBillede; images?: FalBillede[] };
  const url = d.image?.url ?? d.images?.[0]?.url;
  if (!url) throw new Error("fal: intet billede i svaret");
  return url;
}

/**
 * Referencen kommer som data-URL fra pipelinen (rensede fotos ligger i privat
 * storage og pakkes til data-URL i lib/pipeline/run.ts). fal skal kunne HENTE
 * billedet, så data-URLs uploades til fal's eget midlertidige lager først;
 * http-URLs sendes videre som de er.
 */
async function tilFalUrl(url: string): Promise<string> {
  if (!url.startsWith("data:")) return url;
  const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
  if (!match) throw new Error("fal: ugyldig data-URL som reference");
  const mime = match[1]!;
  const bytes = Buffer.from(match[2]!, "base64");
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  return fal.storage.upload(blob);
}

export class FalImageProvider implements ImageProvider {
  constructor(private opsaetning: FalOpsaetning) {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY mangler — brug mock-providers uden nøgler");
    fal.config({ credentials: key });
  }

  async rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat> {
    // C-1: neutral flade + global korrektion — ALDRIG lokal retouch.
    // Samme instruks som Gemini-provideren, så rensen ikke skifter karakter
    // med modelvalget i admin.
    const { url } = await this.generer(
      "Place this exact garment on a clean, neutral light-grey studio background. " +
        "Only replace the background and apply gentle global light/color correction. " +
        "Preserve the garment pixel-faithfully: keep all wear, stains, pilling and flaws exactly where they are.",
      input.fotoUrl,
    );
    return { url, costDkk: this.opsaetning.costDkk };
  }

  async genererOnModel(input: OnModelInput): Promise<OnModelResultat> {
    // Edit-endpointsene har ingen numerisk reference-styrke (nano-bananas
    // `strength` findes ikke på FLUX.2/Qwen/Seedream), så C-3-retryens
    // strammere vægt oversættes til en skærpet instruks — samme greb som i
    // gemini.ts, så retryen betyder det samme uanset valgt model.
    const strammere =
      input.referenceVaegt >= 0.8
        ? " Match the reference garment EXACTLY — every print, seam, colour and proportion must be identical to the reference photo."
        : "";
    const { url, jobId } = await this.generer(
      input.prompt + strammere,
      input.referenceUrl,
    );
    return { url, providerJobId: jobId, costDkk: this.opsaetning.costDkk };
  }

  private async generer(
    prompt: string,
    referenceUrl: string,
  ): Promise<{ url: string; jobId: string }> {
    const billedUrl = await tilFalUrl(referenceUrl);
    const resultat = await fal.subscribe(this.opsaetning.model, {
      input: {
        prompt,
        image_urls: [billedUrl],
        image_size: BILLED_STOERRELSE,
        ...(this.opsaetning.ekstraInput ?? {}),
      },
    });
    return {
      url: foersteBillede(resultat.data),
      jobId: resultat.requestId ?? crypto.randomUUID(),
    };
  }
}
