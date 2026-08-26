import "server-only";

// Start af trial-kørslen. Rækkefølgen (26/8, efter prod-hændelsen):
//
//   1) Trigger.dev — vejen når jobbet "trial-pipeline" er deployet. VIGTIGT:
//      Trigger.dev AFVISER IKKE et udeployet task-id, men parkerer kørslen i
//      PENDING_VERSION for evigt, så handoff'et ligner en succes. Derfor
//      aflæses kørslens status én gang efter trigger; venter den på et
//      deploy, annulleres den (den må ikke vågne uger senere), og vi går
//      videre til reserven.
//   2) Netlify-baggrundsfunktionen (reserven) — kører kørslen på Netlify
//      selv med 15 minutters loft og sitets egne nøgler. KUN et øjeblikkeligt
//      202 tæller: på en konto uden background functions kører funktionen
//      synkront, og så må den ikke regnes som startet — den strandede
//      invokation aborterer selv på kø-dommen, fordi rækken allerede står
//      failed, og koster derfor intet.
//   3) I processen — KUN hvor processen overlever svaret (next dev / mock):
//      på Netlify fryses funktionen når svaret er sendt, og kørslen ville dø
//      stille, mens den besøgende venter forgæves (det VAR prod-hændelsen).
//
// Kan ingen af vejene bruges, svares ærligt false — kalderen markerer rækken
// failed, og den besøgende får en øjeblikkelig, ærlig fejl.

import { createHmac } from "node:crypto";
import { opretServiceKlient } from "@/lib/supabase/service";
import { koerOgGemTrial } from "./koersel";

/** In-process overlever kun i en langtidslevende proces: `next dev` og
 *  mock-demoer. På Netlify (production-build) fryses processen efter svaret. */
function processenOverleverKoerslen(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.MOCK_PROVIDERS === "1";
}

/** Reserven: start kørslen i Netlify-baggrundsfunktionen. Kaldet signeres
 *  med HMAC over kroppen (nøglen er SUPABASE_SERVICE_ROLE_KEY, som begge
 *  sider har), så ingen udefra kan starte kørsler. */
async function startViaNetlifyBaggrund(
  trialId: string,
  originalSti: string,
): Promise<boolean> {
  const base = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !noegle) return false;
  const krop = JSON.stringify({ trialId, originalSti });
  const signatur = createHmac("sha256", noegle).update(krop).digest("hex");
  try {
    const svar = await fetch(
      `${base.replace(/\/+$/, "")}/.netlify/functions/trial-koersel-background`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-selja-signatur": signatur },
        body: krop,
        // Ægte baggrund svarer 202 på et øjeblik — alt langsommere er en
        // synkron kørsel, vi ikke må vente på (og ikke må regne som startet)
        signal: AbortSignal.timeout(2500),
      },
    );
    if (svar.status === 202) return true;
    console.error(
      `Netlify-baggrundsfunktionen svarede ${svar.status} for trial ${trialId} — regnes ikke som startet`,
    );
    return false;
  } catch (fejl) {
    console.error(`Netlify-baggrundsfunktionen kunne ikke kaldes for trial ${trialId}:`, fejl);
    return false;
  }
}

/**
 * Start kørslen for en oprettet trial. `true` = kørslen ER reelt i gang
 * (Trigger.dev, Netlify-baggrund eller en overlevende lokal proces).
 * `false` = intet blev startet — kalderen skal markere rækken failed og
 * svare ærligt nu, aldrig lade den besøgende vente på et job, der ikke
 * findes.
 */
export async function startTrial(trialId: string, originalSti: string): Promise<boolean> {
  if (process.env.TRIGGER_SECRET_KEY) {
    try {
      const { tasks, runs } = await import("@trigger.dev/sdk");
      const handle = await tasks.trigger("trial-pipeline", { trialId, originalSti });
      let venterPaaDeploy = false;
      try {
        const koersel = await runs.retrieve(handle.id);
        const status = koersel.status as string;
        venterPaaDeploy = status === "PENDING_VERSION" || status === "WAITING_FOR_DEPLOY";
      } catch {
        // Kan status ikke aflæses, antages kørslen i gang — jobbet selv
        // efterlader aldrig en række uden slut-status
      }
      if (!venterPaaDeploy) return true;
      console.error(
        `Trial ${trialId}: kørslen venter på et deploy af "trial-pipeline" (PENDING_VERSION) — annulleres; reserven tager over`,
      );
      try {
        await runs.cancel(handle.id);
      } catch {
        // best effort — kø-dommen i koerOgGemTrial fanger den alligevel
      }
    } catch (fejl) {
      console.error(
        `Trigger.dev afviste trial-jobbet (er "trial-pipeline" deployet med npx trigger.dev deploy?):`,
        fejl,
      );
    }
  }

  if (await startViaNetlifyBaggrund(trialId, originalSti)) return true;

  if (!processenOverleverKoerslen()) {
    console.error(
      `Trial ${trialId}: hverken Trigger.dev eller Netlify-baggrund kunne starte kørslen — afvises ærligt`,
    );
    return false;
  }
  void koerOgGemTrial(opretServiceKlient(), trialId, originalSti).catch(() => {
    // Allerede logget og markeret failed i koerOgGemTrial
  });
  return true;
}
