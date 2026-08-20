// Trigger.dev-jobdefinition (G-3): langvarige pipeline-kørsler ligger her,
// aldrig i Netlify-routes (HANDOFF §3). Selve logikken bor i lib/pipeline/run.ts
// og er testet mod mocks; jobbet kobler kun rigtige afhængigheder på.

import { task } from "@trigger.dev/sdk";
import { site } from "@/lib/config";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import {
  bedstMuligt,
  sendAnnonceKlar,
  sendKreditRefunderet,
} from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { koerItemPipeline, koerRegenerering, type RegenDel } from "@/lib/pipeline/run";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServiceKlient } from "@/lib/supabase/service";

export type ItemPipelinePayload = {
  itemId: string;
  presetId?: string;
  /** Brugerens valgte visninger (ejer-ordre 20/8); uden = spejlbilledet */
  visninger?: string[];
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
      payload.visninger,
    );

    // S32: leverancemail — "annonce klar" ved fuld leverance, "kredit sat
    // tilbage" ved delvis (B-6). Best-effort: en fejlet mail må aldrig vælte
    // jobbet eller udløse en genkørsel (og dermed dobbeltmail).
    await bedstMuligt(async () => {
      const { data } = await klient
        .from("items")
        .select("profiles(email)")
        .eq("id", payload.itemId)
        .single();
      const profil = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;
      const til = (profil as { email?: string } | null | undefined)?.email;
      if (!til) return;
      const itemTitel = resultat.tekst.titel;
      const itemUrl = `${site.baseUrl}/items/${payload.itemId}`;
      const afsender = hentEmailAfsender();
      if (resultat.refunderet) {
        await sendKreditRefunderet(afsender, { til, itemTitel, itemUrl });
      } else {
        await sendAnnonceKlar(afsender, { til, itemTitel, itemUrl });
      }
    });

    return {
      itemId: payload.itemId,
      leveret: true,
      delvis: resultat.refunderet,
      totalCostDkk: resultat.totalCostDkk,
    };
  },
});

export type RegenPayload = {
  itemId: string;
  del: RegenDel;
  requestId: string;
  presetId?: string;
};

// B-8: regenerering af én del. requestId er ledger-nøglen, så genkørsler af
// samme job aldrig trækker dobbelt (E-4).
export const itemRegen = task({
  id: "item-regen",
  retry: { maxAttempts: 2 },
  run: async (payload: RegenPayload) => {
    const klient = opretServiceKlient();
    const resultat = await koerRegenerering(
      {
        db: new SupabasePipelineDb(klient),
        storage: new SupabasePipelineStorage(klient),
        image: await hentImageProvider(),
        text: await hentTextProvider(),
        ledger: new SupabaseLedgerDb(klient),
      },
      payload.itemId,
      payload.del,
      { requestId: payload.requestId, presetId: payload.presetId },
    );
    return {
      itemId: payload.itemId,
      del: payload.del,
      saldoEfter: resultat.saldoEfter,
    };
  },
});
