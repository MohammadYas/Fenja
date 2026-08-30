import "server-only";

// Start (og genstart) af item-pipelinen — delt mellem opret-, genoptag- og
// regenerer-API'erne. Rækkefølgen (30/8, efter prod-hændelsen):
//
//   1) Netlify-baggrundsfunktionen — FØRSTEVALGET i produktion: kører på
//      Netlify selv med 15 minutters loft og sitets egne nøgler, opdateres
//      af hvert almindeligt deploy, og 202-kvitteringen er utvetydig.
//      KUN et øjeblikkeligt 202 tæller: på en konto uden background
//      functions kører funktionen synkront, og så må den ikke regnes som
//      startet.
//   2) Trigger.dev — reserven. VIGTIGT: Trigger.dev afviser IKKE et
//      udeployet task-id, men parkerer kørslen i PENDING_VERSION for evigt,
//      så handoff'et ligner en succes. Derfor aflæses status to gange med en
//      pause; venter kørslen på et deploy, annulleres den.
//   3) I processen — KUN hvor processen overlever svaret (next dev / mock):
//      på Netlify fryses funktionen når svaret er sendt.
//
// Hvorfor Netlify FØR Trigger.dev: Trigger.dev-bundtet opdateres kun af
// `npx trigger.dev deploy`, som aldrig er kørt (TRIGGER_ACCESS_TOKEN
// mangler). Produktionen kørte 30/8 stadig bundtet fra 22/8 — otte dage
// gammel kode, hvor leveringsmodellens 503 væltede hvert eneste billede,
// mens alle rettelser siden lå ubrugte i main.

import { createHmac } from "node:crypto";
import { koerItemSikkert, koerRegenSikkert } from "@/lib/pipeline/koersel";
import type { RegenDel } from "@/lib/pipeline/run";
import { opretServiceKlient } from "@/lib/supabase/service";

/** Hvilken motor tog kørslen — false = ingen. */
export type PipelineMotor = "netlify" | "trigger" | "proces";

type Opgave =
  | { slags: "pipeline"; itemId: string; presetId?: string; visninger?: string[] }
  | {
      slags: "regen";
      itemId: string;
      del: RegenDel;
      requestId: string;
      presetId?: string;
    };

/** In-process overlever kun i en langtidslevende proces: `next dev` og
 *  mock-demoer. På Netlify (production-build) fryses processen efter svaret. */
export function kanKoereInline(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.MOCK_PROVIDERS === "1";
}

/** Kaldet signeres med HMAC over kroppen (nøglen er SUPABASE_SERVICE_ROLE_KEY,
 *  som begge sider har), så ingen udefra kan starte kørsler. */
async function startViaNetlifyBaggrund(opgave: Opgave): Promise<boolean> {
  const base = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !noegle) return false;
  const krop = JSON.stringify(opgave);
  const signatur = createHmac("sha256", noegle).update(krop).digest("hex");
  try {
    const svar = await fetch(
      `${base.replace(/\/+$/, "")}/.netlify/functions/item-koersel-background`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-selja-signatur": signatur },
        body: krop,
        // Ægte baggrund svarer 202 på et øjeblik — alt langsommere er en
        // synkron kørsel, vi hverken må vente på eller regne som startet
        signal: AbortSignal.timeout(2500),
      },
    );
    if (svar.status === 202) return true;
    console.error(
      `Netlify-baggrundsfunktionen svarede ${svar.status} for item ${opgave.itemId} — regnes ikke som startet`,
    );
    return false;
  } catch (fejl) {
    console.error(
      `Netlify-baggrundsfunktionen kunne ikke kaldes for item ${opgave.itemId}:`,
      fejl,
    );
    return false;
  }
}

async function startViaTriggerDev(opgave: Opgave): Promise<boolean> {
  const jobId = opgave.slags === "pipeline" ? "item-pipeline" : "item-regen";
  const payload =
    opgave.slags === "pipeline"
      ? {
          itemId: opgave.itemId,
          presetId: opgave.presetId,
          visninger: opgave.visninger,
        }
      : {
          itemId: opgave.itemId,
          del: opgave.del,
          requestId: opgave.requestId,
          presetId: opgave.presetId,
        };
  try {
    const { tasks, runs } = await import("@trigger.dev/sdk");
    const handle = await tasks.trigger(jobId, payload);
    // Lige efter trigger kan status nå at stå QUEUED, FØR den flyttes til
    // PENDING_VERSION — derfor to aflæsninger med en kort pause.
    for (const ventMs of [0, 1500]) {
      if (ventMs > 0) await new Promise((r) => setTimeout(r, ventMs));
      try {
        const koersel = await runs.retrieve(handle.id);
        const status = koersel.status as string;
        if (status === "PENDING_VERSION" || status === "WAITING_FOR_DEPLOY") {
          console.error(
            `Item ${opgave.itemId}: kørslen venter på et deploy af "${jobId}" (${status}) — annulleres`,
          );
          try {
            await runs.cancel(handle.id);
          } catch {
            // best effort
          }
          return false;
        }
      } catch {
        // Kan status ikke aflæses, antages kørslen i gang
      }
    }
    return true;
  } catch (fejl) {
    console.error(`Trigger.dev afviste jobbet "${jobId}" for item ${opgave.itemId}:`, fejl);
    return false;
  }
}

async function markerItemFejlet(itemId: string): Promise<void> {
  const { error } = await opretServiceKlient()
    .from("items")
    .update({ status: "failed" })
    .eq("id", itemId);
  if (error) {
    console.error(`Kunne ikke markere item ${itemId} som fejlet:`, error);
  }
}

async function vaelgMotor(
  opgave: Opgave,
  koerILokalProces: () => void,
): Promise<PipelineMotor | false> {
  const kanKoereLokalt = kanKoereInline();
  if (!kanKoereLokalt && (await startViaNetlifyBaggrund(opgave))) return "netlify";
  if (process.env.TRIGGER_SECRET_KEY && (await startViaTriggerDev(opgave))) return "trigger";
  if (!kanKoereLokalt) return false;
  koerILokalProces();
  return "proces";
}

/**
 * Start pipelinen for en oprettet (eller genoptaget) annonce. Kan ingen motor
 * tage kørslen, markeres annoncen failed med det samme — så UI'et tilbyder
 * genstart i stedet for at vise falsk fremdrift i timevis.
 */
export async function startPipeline(
  itemId: string,
  presetId?: string,
  visninger?: string[],
): Promise<PipelineMotor | false> {
  const motor = await vaelgMotor(
    { slags: "pipeline", itemId, presetId, visninger },
    () => void koerItemSikkert(itemId, presetId, visninger),
  );
  if (motor === false) {
    console.error(
      `Item ${itemId}: hverken Netlify-baggrund eller Trigger.dev kunne starte kørslen — markeres failed`,
    );
    await markerItemFejlet(itemId);
  }
  return motor;
}

/**
 * Start regenerering af én del. Annoncen er allerede leveret, så en motor der
 * ikke kan tage kørslen ændrer INTET på itemet — kalderen svarer ærligt fejl.
 */
export async function startRegen(
  itemId: string,
  del: RegenDel,
  requestId: string,
  presetId?: string,
): Promise<PipelineMotor | false> {
  const motor = await vaelgMotor(
    { slags: "regen", itemId, del, requestId, presetId },
    () => void koerRegenSikkert(itemId, del, requestId, presetId),
  );
  if (motor === false) {
    console.error(`Item ${itemId}: ingen motor kunne tage regenereringen (${del})`);
  }
  return motor;
}
