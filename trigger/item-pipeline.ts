// Trigger.dev-jobdefinition (G-3): langvarige pipeline-kørsler ligger her,
// aldrig i Netlify-routes (HANDOFF §3). Selve logikken bor i lib/pipeline/run.ts
// og er testet mod mocks; jobbet kobler kun rigtige afhængigheder på.

import { task } from "@trigger.dev/sdk";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { koerItemPipeline } from "@/lib/pipeline/run";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServiceKlient } from "@/lib/supabase/service";

export type ItemPipelinePayload = {
  itemId: string;
  presetId?: string;
};

export const itemPipeline = task({
  id: "item-pipeline",
  // Genkørsel af fejlede jobs er sikker: ledger og storage-stier er idempotente (E-4)
  retry: { maxAttempts: 2 },
  run: async (payload: ItemPipelinePayload) => {
    const klient = opretServiceKlient();
    const resultat = await koerItemPipeline(
      {
        db: new SupabasePipelineDb(klient),
        storage: new SupabasePipelineStorage(klient),
        image: await hentImageProvider(),
        text: await hentTextProvider(),
        ledger: new SupabaseLedgerDb(klient),
      },
      payload.itemId,
      payload.presetId,
    );
    return {
      itemId: payload.itemId,
      leveret: true,
      delvis: resultat.refunderet,
      totalCostDkk: resultat.totalCostDkk,
    };
  },
});
