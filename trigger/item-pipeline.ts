// Trigger.dev-jobdefinition (G-3). Selve logikken bor i lib/pipeline/koersel.ts
// og deles med Netlify-baggrundsfunktionen, så de to motorer ALDRIG kan drive
// fra hinanden — jobbet her kobler kun Trigger.dev's retry på.
//
// NB (30/8): Trigger.dev-bundtet opdateres kun af `npx trigger.dev deploy`,
// og det deploy er aldrig kørt. Produktionen kører derfor Netlify-
// baggrundsfunktionen som førstevalg (lib/pipeline/start.ts); dette job er
// reserven og bliver først aktuelt, når TRIGGER_ACCESS_TOKEN er sat og
// deployet har kørt.

import { task } from "@trigger.dev/sdk";
import { koerOgLeverItem, koerOgLeverRegen } from "@/lib/pipeline/koersel";
import type { RegenDel } from "@/lib/pipeline/run";

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
    const resultat = await koerOgLeverItem(
      payload.itemId,
      payload.presetId,
      payload.visninger,
    );
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
    const resultat = await koerOgLeverRegen(
      payload.itemId,
      payload.del,
      payload.requestId,
      payload.presetId,
    );
    return {
      itemId: payload.itemId,
      del: payload.del,
      saldoEfter: resultat.saldoEfter,
    };
  },
});
