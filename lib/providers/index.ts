// Valg af providers: rigtige når nøgler findes, ellers mock — så hele appen
// kan køre lokalt og i CI uden nøgler (NFR-5). Tving mock med MOCK_PROVIDERS=1.
//
// EJER-ORDRE 2026-08-23: billedmodellen vælges i ADMIN-PANELET, ikke i koden.
// Kataloget over godkendte modeller står i lib/config.ts (billedModeller),
// valget pr. formål i databasen (lib/admin/billedmodel-valg.ts). Både Gemini
// og fal ligger bag samme ImageProvider, så et skift er ét klik — ikke en
// deploy. Annoncetekst skrives af DeepSeek (vision kører mod Gemini flash,
// se lib/providers/deepseek.ts).

import { hentValgtModel } from "@/lib/admin/billedmodel-valg";
import {
  billedModelEllerStandard,
  billedModeller,
  type BilledFormaal,
  type BilledModel,
} from "@/lib/config";
import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";
import type { TextProvider } from "./text";
import { MockImageProvider, MockTextProvider } from "./mock";

/** Har vi nøglen til den leverandør, modellen kører hos? */
function harNoegle(model: BilledModel): boolean {
  return model.provider === "fal" ? !!process.env.FAL_KEY : !!process.env.GEMINI_API_KEY;
}

export function erMockTilstand(): boolean {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  // Billeder kan køre på ENTEN Gemini ELLER fal — kun hvis begge nøgler
  // mangler, er der ingen vej til rigtige billeder.
  const harBilledNoegle = !!process.env.GEMINI_API_KEY || !!process.env.FAL_KEY;
  return !harBilledNoegle || !process.env.DEEPSEEK_API_KEY;
}

export async function opretImageProvider(model: BilledModel): Promise<ImageProvider> {
  if (model.provider === "fal") {
    const { FalImageProvider } = await import("./fal");
    return new FalImageProvider(model);
  }
  const { GeminiImageProvider } = await import("./gemini");
  return new GeminiImageProvider(model);
}

/**
 * Den valgte model, men aldrig én vi mangler nøglen til: er admin-valget fx
 * en fal-model, og FAL_KEY ikke sat i miljøet, falder vi tilbage til en model
 * vi FAKTISK kan kalde. En leverance må ikke gå tabt på en manglende nøgle.
 */
async function brugbarModel(formaal: BilledFormaal): Promise<BilledModel> {
  const valgt = await hentValgtModel(formaal);
  if (harNoegle(valgt)) return valgt;
  const standard = billedModelEllerStandard(null, formaal);
  const reserve = harNoegle(standard)
    ? standard
    : billedModeller.find((m) => m.provider !== valgt.provider && harNoegle(m));
  if (!reserve) return valgt; // ingen vej — provideren kaster med en tydelig fejl
  console.warn(
    `Billedmodel ${valgt.id} valgt i admin, men nøglen til ${valgt.provider} mangler — kører på ${reserve.id}`,
  );
  return reserve;
}

// Økonomi (ejer-ordre 20/8: "skal kunne give mening økonomisk"): baggrunds-
// rens er en simpel opgave og kører på preview-modellen, kun selve
// visualiseringen bruger final-modellen. Fundet i e2e: rensen kørte unødigt
// på pro — 0,67 kr. spildt PR. ANNONCE.
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
  if (formaal) return opretImageProvider(await brugbarModel(formaal));
  return new FormaalsDeltImageProvider(
    await opretImageProvider(await brugbarModel("preview")),
    await opretImageProvider(await brugbarModel("final")),
  );
}

export async function hentTextProvider(): Promise<TextProvider> {
  if (erMockTilstand()) return new MockTextProvider();
  const { DeepSeekTextProvider } = await import("./deepseek");
  return new DeepSeekTextProvider();
}
