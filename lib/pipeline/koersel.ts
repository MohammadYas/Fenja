import "server-only";

// Kørslen af item-pipelinen MED rigtige afhængigheder — ét sted. Både
// Netlify-baggrundsfunktionen, Trigger.dev-jobbet og dev-serverens
// in-proces-vej kalder herind, så leverancen (inkl. mailen) er præcis den
// samme, uanset hvilken motor der tog kørslen.
//
// Hvorfor det ligger her og ikke i trigger/: Trigger.dev-bundtet opdateres
// KUN af `npx trigger.dev deploy`, og det deploy er aldrig kørt (mangler
// TRIGGER_ACCESS_TOKEN). Produktionen kørte derfor otte dage gammel kode,
// mens Netlify-deploys så grønne ud. Logikken skal bo et sted, som et
// almindeligt Netlify-deploy faktisk opdaterer.

import { site } from "@/lib/config";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import {
  bedstMuligt,
  sendAnnonceKlar,
  sendKreditRefunderet,
} from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import {
  koerItemPipeline,
  koerRegenerering,
  type PipelineResultat,
  type RegenDel,
} from "@/lib/pipeline/run";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServiceKlient } from "@/lib/supabase/service";

type Klient = ReturnType<typeof opretServiceKlient>;

async function afhaengigheder(klient: Klient) {
  return {
    db: new SupabasePipelineDb(klient),
    storage: new SupabasePipelineStorage(klient),
    image: await hentImageProvider(),
    text: await hentTextProvider(),
    ledger: new SupabaseLedgerDb(klient),
  };
}

/** S32: leverancemail — "annonce klar" ved fuld leverance, "kredit sat
 *  tilbage" ved delvis (B-6). Best-effort: en fejlet mail må aldrig vælte
 *  kørslen eller udløse en genkørsel (og dermed dobbeltmail). */
async function sendLeverancemail(
  klient: Klient,
  itemId: string,
  resultat: PipelineResultat,
): Promise<void> {
  await bedstMuligt(async () => {
    const { data } = await klient
      .from("items")
      .select("profiles(email)")
      .eq("id", itemId)
      .single();
    const profil = Array.isArray(data?.profiles) ? data.profiles[0] : data?.profiles;
    const til = (profil as { email?: string } | null | undefined)?.email;
    if (!til) return;
    // Teksten kan være fejlet (bulletproof: billeder leveres alligevel) —
    // mailen falder tilbage til en neutral titel
    const itemTitel = resultat.tekst?.titel ?? "Din annonce";
    const itemUrl = `${site.baseUrl}/items/${itemId}`;
    const afsender = hentEmailAfsender();
    if (resultat.refunderet) {
      await sendKreditRefunderet(afsender, { til, itemTitel, itemUrl });
    } else {
      await sendAnnonceKlar(afsender, { til, itemTitel, itemUrl });
    }
  });
}

export async function koerOgLeverItem(
  itemId: string,
  presetId?: string,
  visninger?: string[],
): Promise<PipelineResultat> {
  const klient = opretServiceKlient();
  const resultat = await koerItemPipeline(
    await afhaengigheder(klient),
    itemId,
    presetId,
    visninger,
  );
  await sendLeverancemail(klient, itemId, resultat);
  return resultat;
}

export async function koerOgLeverRegen(
  itemId: string,
  del: RegenDel,
  requestId: string,
  presetId?: string,
) {
  const klient = opretServiceKlient();
  return koerRegenerering(await afhaengigheder(klient), itemId, del, {
    requestId,
    presetId,
  });
}

/** Kørsel uden kalder til at fange fejlen: en væltet pipeline må aldrig
 *  efterlade annoncen i evigt "på vej" — den markeres failed, så UI'et kan
 *  tilbyde genstart. Intet kredittræk er sket (kreditter trækkes ved
 *  leverance). Bruges af motorerne uden egen retry. */
export async function koerItemSikkert(
  itemId: string,
  presetId?: string,
  visninger?: string[],
): Promise<void> {
  try {
    await koerOgLeverItem(itemId, presetId, visninger);
  } catch (fejl) {
    console.error(`Pipeline fejlede for item ${itemId}:`, fejl);
    const { error } = await opretServiceKlient()
      .from("items")
      .update({ status: "failed" })
      .eq("id", itemId);
    if (error) {
      console.error(`Kunne ikke markere item ${itemId} som fejlet:`, error);
    }
  }
}

/** Regenerering er en delleverance på en allerede leveret annonce — fejler
 *  den, står annoncen stadig. Kun logning, ingen statusændring. */
export async function koerRegenSikkert(
  itemId: string,
  del: RegenDel,
  requestId: string,
  presetId?: string,
): Promise<void> {
  try {
    await koerOgLeverRegen(itemId, del, requestId, presetId);
  } catch (fejl) {
    console.error(`Regenerering (${del}) fejlede for item ${itemId}:`, fejl);
  }
}
