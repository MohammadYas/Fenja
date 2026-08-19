// Valg af providers: rigtige når nøgler findes, ellers mock — så hele appen
// kan køre lokalt og i CI uden nøgler (NFR-5). Tving mock med MOCK_PROVIDERS=1.
// EJER-BESLUTNING 2026-08-19: Gemini er ENESTE billedprovider (fal ude af
// valg og failover); annoncetekst skrives af DeepSeek (vision kører mod
// Gemini flash, se lib/providers/deepseek.ts). Billedmodellen vælges pr.
// formål i config (billedProvidere).

import { billedProvidere, type BilledFormaal } from "@/lib/config";
import type { ImageProvider } from "./image";
import type { TextProvider } from "./text";
import { MockImageProvider, MockTextProvider } from "./mock";

export function erMockTilstand(): boolean {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  return !process.env.GEMINI_API_KEY || !process.env.DEEPSEEK_API_KEY;
}

export async function hentImageProvider(
  formaal: BilledFormaal = "final",
): Promise<ImageProvider> {
  if (erMockTilstand()) return new MockImageProvider();
  const { GeminiImageProvider } = await import("./gemini");
  return new GeminiImageProvider(billedProvidere.gemini[formaal]);
}

export async function hentTextProvider(): Promise<TextProvider> {
  if (erMockTilstand()) return new MockTextProvider();
  const { DeepSeekTextProvider } = await import("./deepseek");
  return new DeepSeekTextProvider();
}
