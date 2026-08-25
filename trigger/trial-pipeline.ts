// Trigger.dev-job for den gratis prøve (samme princip som item-pipeline:
// langvarige kørsler bor her, aldrig i Netlify-routes). BEVIDST ingen retry —
// én trial er ét forsøg (ejer-krav 6): fejler den, står rækken som failed,
// og den besøgende kan selv vælge at prøve igen (fejlede låser ikke IP'en).

import { task } from "@trigger.dev/sdk";
import { koerOgGemTrial } from "@/lib/trial/koersel";
import { opretServiceKlient } from "@/lib/supabase/service";

export type TrialPipelinePayload = {
  trialId: string;
  originalSti: string;
};

export const trialPipeline = task({
  id: "trial-pipeline",
  retry: { maxAttempts: 1 },
  run: async (payload: TrialPipelinePayload) => {
    await koerOgGemTrial(opretServiceKlient(), payload.trialId, payload.originalSti);
    return { trialId: payload.trialId };
  },
});
