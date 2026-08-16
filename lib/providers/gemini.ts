// Google Gemini-implementering af ImageProvider (C-7) — REST via fetch, ingen
// ny dependency. Model-id og cost-skøn kommer ALTID fra config
// (lib/config.ts, billedProvidere) — provideren hårdkoder aldrig modeller.
// Kræver GEMINI_API_KEY; bruges aldrig i CI — tests kører mod mock (NFR-5).

import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export type GeminiOpsaetning = {
  /** Model-id fra config — fx final- eller preview-modellen i billedProvidere */
  model: string;
  /** Skøn i kr. pr. genereret billede fra config — kalibreres i S12 (G-1/NFR-11) */
  costDkk: number;
};

type GeminiDel = { text: string } | { inlineData: { mimeType: string; data: string } };

type GeminiSvar = {
  responseId?: string;
  candidates?: {
    content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
  }[];
};

/** Reference-billeder sendes som inlineData-parts — data-URLs pakkes ud, http-URLs hentes */
async function tilInlineData(
  url: string,
): Promise<{ mimeType: string; data: string }> {
  if (url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.+)$/.exec(url);
    if (!match) throw new Error("gemini: ugyldig data-URL som reference");
    return { mimeType: match[1]!, data: match[2]! };
  }
  const svar = await fetch(url);
  if (!svar.ok) {
    throw new Error(`gemini: kunne ikke hente referencebillede (HTTP ${svar.status})`);
  }
  return {
    mimeType: svar.headers.get("content-type") ?? "image/jpeg",
    data: Buffer.from(await svar.arrayBuffer()).toString("base64"),
  };
}

export class GeminiImageProvider implements ImageProvider {
  private noegle: string;

  constructor(private opsaetning: GeminiOpsaetning) {
    const noegle = process.env.GEMINI_API_KEY;
    if (!noegle) {
      throw new Error("GEMINI_API_KEY mangler — brug mock-providers uden nøgler");
    }
    this.noegle = noegle;
  }

  async rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat> {
    // C-1: neutral flade + global korrektion — ALDRIG lokal retouch
    const { url } = await this.generer([
      {
        text:
          "Place this exact garment on a clean, neutral light-grey studio background. " +
          "Only replace the background and apply gentle global light/color correction. " +
          "Preserve the garment pixel-faithfully: keep all wear, stains, pilling and flaws exactly where they are.",
      },
      { inlineData: await tilInlineData(input.fotoUrl) },
    ]);
    return { url, costDkk: this.opsaetning.costDkk };
  }

  async genererOnModel(input: OnModelInput): Promise<OnModelResultat> {
    // Gemini har ingen numerisk reference-styrke som fal's strength — en
    // strammere vægt (C-3-retry) oversættes til en skærpet instruks i prompten.
    const strammere =
      input.referenceVaegt >= 0.8
        ? " Match the reference garment EXACTLY — every print, seam, colour and proportion must be identical to the reference photo."
        : "";
    const { url, jobId } = await this.generer([
      { text: input.prompt + strammere },
      { inlineData: await tilInlineData(input.referenceUrl) },
    ]);
    return { url, providerJobId: jobId, costDkk: this.opsaetning.costDkk };
  }

  private async generer(parts: GeminiDel[]): Promise<{ url: string; jobId: string }> {
    const svar = await fetch(
      `${API_BASE}/models/${this.opsaetning.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": this.noegle,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            // 2:3 ligger tæt på Vinteds visning; 4:5-beskæring tilbydes i C-8
            imageConfig: { aspectRatio: "2:3" },
          },
        }),
      },
    );
    if (!svar.ok) {
      const tekst = (await svar.text()).slice(0, 300);
      throw new Error(`gemini: HTTP ${svar.status} — ${tekst}`);
    }
    const data = (await svar.json()) as GeminiSvar;
    const billede = data.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.data,
    )?.inlineData;
    if (!billede?.data) throw new Error("gemini: intet billede i svaret");
    return {
      // Base64 fra svaret pakkes som data-URL; kalderen henter og gemmer i eget storage
      url: `data:${billede.mimeType ?? "image/png"};base64,${billede.data}`,
      jobId: data.responseId ?? crypto.randomUUID(),
    };
  }
}
