// Start (og genstart) af item-pipelinen — delt mellem opret-API'et og
// genoptag-API'et (bulletproof, ejer-ordre 2026-08-20). Med Trigger.dev-nøgle
// kører jobbet dér (G-3, overlever server-genstarter — vejen i produktion);
// uden nøgle køres i processen, og en genstart kan samle en hængende kørsel
// op via genoptag-endpointet. Ledger + storage er idempotente, så en
// genkørsel aldrig trækker dobbelt eller overskriver leverancer (E-4).

import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { koerItemPipeline } from "@/lib/pipeline/run";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServiceKlient } from "@/lib/supabase/service";

export async function startPipeline(
  itemId: string,
  presetId: string,
  visninger: string[],
): Promise<void> {
  if (process.env.TRIGGER_SECRET_KEY) {
    const { tasks } = await import("@trigger.dev/sdk");
    await tasks.trigger("item-pipeline", { itemId, presetId, visninger });
    return;
  }
  const service = opretServiceKlient();
  void koerItemPipeline(
    {
      db: new SupabasePipelineDb(service),
      storage: new SupabasePipelineStorage(service),
      image: await hentImageProvider(),
      text: await hentTextProvider(),
      ledger: new SupabaseLedgerDb(service),
    },
    itemId,
    presetId,
    visninger,
  ).catch(async (fejl) => {
    console.error(`Pipeline fejlede for item ${itemId}:`, fejl);
    // En væltet pipeline må aldrig efterlade annoncen i evigt "på vej" —
    // markér den, så UI'et kan tilbyde genstart. Intet kredittræk er sket
    // (kreditter trækkes først ved leverance).
    const { error } = await service
      .from("items")
      .update({ status: "failed" })
      .eq("id", itemId);
    if (error) {
      console.error(`Kunne ikke markere item ${itemId} som fejlet:`, error);
    }
  });
}
