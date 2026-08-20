// On-model-generering med automatisk troskabs-tjek og én retry med strammere
// reference (C-2/C-3). Under tærskel efter retry → null (delvis leverance, B-6):
// et misvisende AI-billede er værre end intet AI-billede.

import { pipeline as cfg } from "@/lib/config";
import type { ImageProvider } from "@/lib/providers/image";
import type { TextProvider } from "@/lib/providers/text";
import { tjekTroskab } from "./fidelity";
import { hentPreset } from "./presets";
import { bygOnModelPromptMedSkabelon } from "./skabeloner";
import type { VisningsType } from "./visninger";

export type OnModelUdfald = {
  /** null når troskaben ikke kunne opnås — rens + tekst leveres alligevel */
  billede: {
    url: string;
    providerJobId: string;
    fidelityScore: number;
  } | null;
  forsoeg: number;
  costDkk: number;
  /** Seneste scores til statistik/kalibrering (FR-15) */
  scores: number[];
};

export async function genererOnModelMedTroskab(args: {
  image: ImageProvider;
  text: TextProvider;
  itemId: string;
  presetId: string;
  /** Renset helhedsfoto som styrende reference */
  referenceUrl: string;
  /** Sælgerens id — giver det faste hjem-anker, så alle annoncer ligner samme bolig */
  userId?: string;
  /** Itemets fritekst-kategori (B-3) — vælger kategori-skabelonen */
  kategori?: string | null;
  /** Sælgerens selvvalgte hjem-id (S31); ukendt/tomt → det deterministiske */
  hjemAnker?: string | null;
  /** Brugerens valgte visningstype (ejer-ordre 20/8) */
  visning?: VisningsType;
}): Promise<OnModelUdfald> {
  const preset = hentPreset(args.presetId);
  const prompt = bygOnModelPromptMedSkabelon({
    preset,
    itemId: args.itemId,
    userId: args.userId,
    kategori: args.kategori,
    hjemAnker: args.hjemAnker,
    visning: args.visning,
  });
  const vaegte = [cfg.normalReferenceVaegt, cfg.strammereReferenceVaegt];

  let cost = 0;
  const scores: number[] = [];

  for (let forsoeg = 0; forsoeg < cfg.onModelForsoeg; forsoeg++) {
    let genereret;
    try {
      genereret = await args.image.genererOnModel({
        referenceUrl: args.referenceUrl,
        prompt,
        referenceVaegt: vaegte[forsoeg] ?? cfg.strammereReferenceVaegt,
      });
    } catch {
      // Provider-fejl tæller som et brugt forsøg; næste runde strammere
      continue;
    }
    cost += genereret.costDkk;

    const troskab = await tjekTroskab(args.text, {
      aegteUrl: args.referenceUrl,
      genereretUrl: genereret.url,
    });
    cost += troskab.costDkk;
    scores.push(troskab.score);

    if (troskab.bestaaet) {
      return {
        billede: {
          url: genereret.url,
          providerJobId: genereret.providerJobId,
          fidelityScore: troskab.score,
        },
        forsoeg: forsoeg + 1,
        costDkk: cost,
        scores,
      };
    }
  }

  return { billede: null, forsoeg: cfg.onModelForsoeg, costDkk: cost, scores };
}
