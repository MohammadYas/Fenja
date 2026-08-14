// Troskabs-tjek (C-3/K1): sammenligner ægte foto med genereret billede via
// vision-modellen og afgør pass/fail mod den kalibrerbare tærskel.

import { pipeline as cfg } from "@/lib/config";
import type { TextProvider, TroskabsInput } from "@/lib/providers/text";

export type TroskabsAfgoerelse = {
  bestaaet: boolean;
  score: number;
  begrundelse: string;
  costDkk: number;
};

export async function tjekTroskab(
  text: TextProvider,
  input: TroskabsInput,
): Promise<TroskabsAfgoerelse> {
  const resultat = await text.vurderTroskab(input);
  return {
    bestaaet: resultat.score >= cfg.troskabsTaerskel,
    score: resultat.score,
    begrundelse: resultat.begrundelse,
    costDkk: resultat.costDkk,
  };
}
