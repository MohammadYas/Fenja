// Valg af providers: rigtige når nøgler findes, ellers mock — så hele appen
// kan køre lokalt og i CI uden nøgler (NFR-5). Tving mock med MOCK_PROVIDERS=1.
// Billedprovideren vælges pr. formål i config (billedProvidere) — vinderen af
// Gate 1-trekampen aktiveres dér med én linje. fal er altid failover.

import { billedProvidere, type BilledFormaal } from "@/lib/config";
import type { ImageProvider } from "./image";
import type { TextProvider } from "./text";
import { MockImageProvider, MockTextProvider } from "./mock";

export function erMockTilstand(): boolean {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  return !process.env.FAL_KEY || !process.env.ANTHROPIC_API_KEY;
}

export async function hentImageProvider(
  formaal: BilledFormaal = "final",
): Promise<ImageProvider> {
  if (erMockTilstand()) return new MockImageProvider();
  if (billedProvidere.valg[formaal] === "gemini" && process.env.GEMINI_API_KEY) {
    const { GeminiImageProvider } = await import("./gemini");
    return new GeminiImageProvider(billedProvidere.gemini[formaal]);
  }
  // fal er failover: valgt gemini uden nøgle falder tilbage hertil
  const { FalImageProvider } = await import("./fal");
  return new FalImageProvider();
}

export async function hentTextProvider(): Promise<TextProvider> {
  if (erMockTilstand()) return new MockTextProvider();
  const { AnthropicTextProvider } = await import("./anthropic");
  return new AnthropicTextProvider();
}
