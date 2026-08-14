// fal.ai-implementering af ImageProvider (SPEC §8.1). Kræver FAL_KEY —
// bruges aldrig i CI; tests kører mod mock (C-7). Endpoints kan overstyres
// med env, så modelskift ikke kræver kodeændring.

import { fal } from "@fal-ai/client";
import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";

const RENS_ENDPOINT = process.env.FAL_RENS_ENDPOINT ?? "fal-ai/birefnet/v2";
const ONMODEL_ENDPOINT =
  process.env.FAL_ONMODEL_ENDPOINT ?? "fal-ai/nano-banana/edit";

// Skøn i kr. pr. kald — kalibreres i S12 mod faktiske fal-priser (G-1/NFR-11)
const RENS_COST_DKK = 0.1;
const ONMODEL_COST_DKK = 0.45;

type FalBillede = { url: string };

function foersteBillede(data: unknown): string {
  const d = data as { image?: FalBillede; images?: FalBillede[] };
  const url = d.image?.url ?? d.images?.[0]?.url;
  if (!url) throw new Error("fal: intet billede i svaret");
  return url;
}

export class FalImageProvider implements ImageProvider {
  constructor() {
    const key = process.env.FAL_KEY;
    if (!key) throw new Error("FAL_KEY mangler — brug mock-providers uden nøgler");
    fal.config({ credentials: key });
  }

  async rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat> {
    const resultat = await fal.subscribe(RENS_ENDPOINT, {
      input: { image_url: input.fotoUrl },
    });
    return { url: foersteBillede(resultat.data), costDkk: RENS_COST_DKK };
  }

  async genererOnModel(input: OnModelInput): Promise<OnModelResultat> {
    const resultat = await fal.subscribe(ONMODEL_ENDPOINT, {
      input: {
        image_urls: [input.referenceUrl],
        prompt: input.prompt,
        // Referencevægt: hæves ved retry for strammere troskab (C-3)
        strength: input.referenceVaegt,
      },
    });
    return {
      url: foersteBillede(resultat.data),
      providerJobId: resultat.requestId,
      costDkk: ONMODEL_COST_DKK,
    };
  }
}
