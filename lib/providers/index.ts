// Valg af providers: rigtige når nøgler findes, ellers mock — så hele appen
// kan køre lokalt og i CI uden nøgler (NFR-5). Tving mock med MOCK_PROVIDERS=1.
// EJER-BESLUTNING 2026-08-19: Gemini er ENESTE billedprovider (fal ude af
// valg og failover); annoncetekst skrives af DeepSeek (vision kører mod
// Gemini flash, se lib/providers/deepseek.ts). Billedmodellen vælges pr.
// formål i config (billedProvidere).

import { billedProvidere, type BilledFormaal } from "@/lib/config";
import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";
import type { TextProvider } from "./text";
import { MockImageProvider, MockTextProvider } from "./mock";

export function erMockTilstand(): boolean {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  return !process.env.GEMINI_API_KEY || !process.env.DEEPSEEK_API_KEY;
}

// Økonomi (ejer-ordre 20/8: "skal kunne give mening økonomisk"): baggrunds-
// rens er en simpel opgave og kører på den billige flash-model (0,28 kr.),
// kun selve visualiseringen bruger pro-modellen (0,95 kr.). Fundet i e2e:
// rensen kørte unødigt på pro — 0,67 kr. spildt PR. ANNONCE.
class FormaalsDeltImageProvider implements ImageProvider {
  constructor(
    private rens: ImageProvider,
    private onmodel: ImageProvider,
  ) {}

  rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat> {
    return this.rens.rensBaggrund(input);
  }

  genererOnModel(input: OnModelInput): Promise<OnModelResultat> {
    return this.onmodel.genererOnModel(input);
  }
}

export async function hentImageProvider(
  formaal?: BilledFormaal,
): Promise<ImageProvider> {
  if (erMockTilstand()) return new MockImageProvider();
  const { GeminiImageProvider } = await import("./gemini");
  if (formaal) return new GeminiImageProvider(billedProvidere.gemini[formaal]);
  return new FormaalsDeltImageProvider(
    new GeminiImageProvider(billedProvidere.gemini.preview),
    new GeminiImageProvider(billedProvidere.gemini.final),
  );
}

export async function hentTextProvider(): Promise<TextProvider> {
  if (erMockTilstand()) return new MockTextProvider();
  const { DeepSeekTextProvider } = await import("./deepseek");
  return new DeepSeekTextProvider();
}
