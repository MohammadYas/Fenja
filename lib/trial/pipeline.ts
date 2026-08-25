// Trial-pipelinen: den BILLIGE vej — foto-analyse → ét gulv/flat-lay-billede →
// annoncetekst med prisforslag. Genbruger promptbygningen og tekstvalideringen
// fra den rigtige pipeline, men rører ALDRIG kreditter, ledger eller
// koerItemPipeline: en trial kan pr. konstruktion ikke trigge betalings-vejen.
//
// Hårdkodet server-side (ejer-krav 8): visning = "gulv", model = den billigste
// godkendte (lib/config.ts trial.*), ét forsøg, intet troskabstjek, ingen
// automatiske retries, 60 sekunders loft. Ingen af delene kan ændres via
// request-parametre — API'et tager kun imod selve fotoet.

import {
  billedModeller,
  hentBilledModel,
  trial,
  pipeline as pipelineCfg,
  type BilledModel,
} from "@/lib/config";
import { genererValideretAnnonceTekst } from "@/lib/pipeline/listing-text";
import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";
import { STANDARD_PRESET_ID, hentPreset } from "@/lib/pipeline/presets";
import { bygOnModelPromptMedSkabelon } from "@/lib/pipeline/skabeloner";
import { hentVisningsType, type VisningsType } from "@/lib/pipeline/visninger";
import { erMockTilstand, opretImageProvider } from "@/lib/providers";
import type { ImageProvider } from "@/lib/providers/image";
import type { AnnonceTekst, TextProvider } from "@/lib/providers/text";
import { MockImageProvider } from "@/lib/providers/mock";
import type { TrialAnalyse } from "./analyse";

export class TrialTidsFejl extends Error {
  constructor() {
    super(`Trial-genereringen nåede ikke i mål inden ${trial.timeoutMs / 1000} sekunder`);
  }
}

export class TrialBilledeFejl extends Error {}

export type TrialDeps = {
  image: ImageProvider;
  text: TextProvider;
  analyse: (fotoDataUrl: string) => Promise<TrialAnalyse>;
};

export type TrialLeverance = {
  /** Provider-URL/data-URL for det RENE billede — kalderen gemmer og vandmærker */
  billedeUrl: string;
  tekst: AnnonceTekst;
  analyse: TrialAnalyse;
  costDkk: number;
};

/** Trialens visning — hårdkodet "liggende" (gulv/flat-lay), aldrig klientstyret */
export function trialVisning(): VisningsType {
  const visning = hentVisningsType(trial.visningId);
  if (!visning) throw new Error(`Trial-visningen "${trial.visningId}" findes ikke`);
  return visning;
}

/** Den hårdkodede billige model — reserve kun når nøglen til førstevalget mangler */
export function trialBilledModel(): BilledModel {
  const valgt = hentBilledModel(trial.billedModelId) ?? billedModeller[0]!;
  const harNoegle =
    valgt.provider === "fal" ? !!process.env.FAL_KEY : !!process.env.GEMINI_API_KEY;
  if (harNoegle) return valgt;
  const reserve = hentBilledModel(trial.billedModelReserveId);
  return reserve ?? valgt;
}

export async function hentTrialImageProvider(): Promise<ImageProvider> {
  if (erMockTilstand()) return new MockImageProvider();
  return opretImageProvider(trialBilledModel());
}

function medTidsfrist<T>(loefte: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TrialTidsFejl()), ms);
    loefte.then(
      (vaerdi) => {
        clearTimeout(timer);
        resolve(vaerdi);
      },
      (fejl) => {
        clearTimeout(timer);
        reject(fejl);
      },
    );
  });
}

/**
 * Kør hele trial-genereringen mod et foto (data-URL). Billede og tekst kører
 * parallelt; fejler billedet, fejler trialen (ét forsøg, ingen retries —
 * fejlede prøver låser ikke IP'en, så den besøgende kan prøve igen selv).
 */
export async function koerTrialGenerering(
  deps: TrialDeps,
  trialId: string,
  fotoDataUrl: string,
  timeoutMs: number = trial.timeoutMs,
): Promise<TrialLeverance> {
  return medTidsfrist(
    (async () => {
      const analyse = await deps.analyse(fotoDataUrl);

      const prompt = bygOnModelPromptMedSkabelon({
        preset: hentPreset(STANDARD_PRESET_ID),
        itemId: trialId,
        kategori: analyse.kategori,
        visning: trialVisning(),
      });

      const [billede, tekst] = await Promise.all([
        deps.image.genererOnModel({
          referenceUrl: fotoDataUrl,
          prompt,
          referenceVaegt: pipelineCfg.normalReferenceVaegt,
        }),
        genererValideretAnnonceTekst(deps.text, {
          maerke: analyse.maerke ?? "",
          stoerrelse: "",
          stand: analyse.stand,
          kategori: analyse.kategori,
          fejlBeskrivelse: null,
          // Analysens beskrivelse + farve giver teksten noget konkret at stå på
          labelTekst:
            [analyse.beskrivelse || null, analyse.farve ? `Farve: ${analyse.farve}` : null]
              .filter(Boolean)
              .join(" · ") || null,
          koebsprisDkk: null,
          markedsinterval: analyse.maerke
            ? findMarkedsinterval(analyse.maerke, analyse.kategori)
            : null,
        }),
      ]);

      if (!billede.url) throw new TrialBilledeFejl("provideren leverede intet billede");

      return {
        billedeUrl: billede.url,
        tekst,
        analyse,
        costDkk: analyse.costDkk + billede.costDkk + tekst.costDkk,
      };
    })(),
    timeoutMs,
  );
}
