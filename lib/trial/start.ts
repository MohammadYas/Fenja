import "server-only";

// Start af trial-kørslen. Rækkefølgen (26/8, efter prod-hændelsen):
//
//   1) Netlify-baggrundsfunktionen — FØRSTEVALGET i produktion: kører
//      kørslen på Netlify selv med 15 minutters loft og sitets egne nøgler,
//      kræver intet Trigger.dev-deploy, og 202-kvitteringen er utvetydig.
//      KUN et øjeblikkeligt 202 tæller: på en konto uden background
//      functions kører funktionen synkront, og så må den ikke regnes som
//      startet — den strandede invokation aborterer selv på kø-dommen,
//      fordi rækken allerede står failed, og koster derfor intet.
//   2) Trigger.dev — når jobbet "trial-pipeline" er deployet. VIGTIGT:
//      Trigger.dev AFVISER IKKE et udeployet task-id, men parkerer kørslen
//      i PENDING_VERSION for evigt, så handoff'et ligner en succes — og
//      lige efter trigger kan status stå QUEUED, før den flyttes til
//      PENDING_VERSION. Derfor aflæses status to gange med en pause;
//      venter kørslen på et deploy, annulleres den.
//   3) I processen — KUN hvor processen overlever svaret (next dev / mock):
//      på Netlify fryses funktionen når svaret er sendt, og kørslen ville
//      dø stille, mens den besøgende venter forgæves (prod-hændelsen).
//
// Kan ingen af vejene bruges, svares ærligt false — kalderen markerer rækken
// failed, og den besøgende får en øjeblikkelig, ærlig fejl. Motoren, der tog
// kørslen, følger med i /api/prov-svaret som fejlsøgnings-markør.

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

/** Hvilken motor tog kørslen — false = ingen (kalderen fejler ærligt).
 *  Værdien følger med i /api/prov-svaret som fejlsøgnings-markør. */
export type TrialMotor = "netlify" | "trigger" | "proces";

async function startViaTriggerDev(trialId: string, originalSti: string): Promise<boolean> {
  try {
    const { tasks, runs } = await import("@trigger.dev/sdk");
    const handle = await tasks.trigger("trial-pipeline", { trialId, originalSti });
    // Trigger.dev afviser ikke et udeployet task-id — kørslen parkeres i
    // PENDING_VERSION og venter for evigt. Status aflæses to gange med en
    // kort pause: lige efter trigger kan den nå at stå QUEUED, FØR den
    // flyttes til PENDING_VERSION (racet bag prod-hændelsen 26/8, del 3).
    for (const ventMs of [0, 1500]) {
      if (ventMs > 0) await new Promise((r) => setTimeout(r, ventMs));
      try {
        const koersel = await runs.retrieve(handle.id);
        const status = koersel.status as string;
        if (status === "PENDING_VERSION" || status === "WAITING_FOR_DEPLOY") {
          console.error(
            `Trial ${trialId}: kørslen venter på et deploy af "trial-pipeline" (${status}) — annulleres`,
          );
          try {
            await runs.cancel(handle.id);
          } catch {
            // best effort — kø-dommen i koerOgGemTrial fanger den alligevel
          }
          return false;
        }
      } catch {
        // Kan status ikke aflæses, antages kørslen i gang — jobbet selv
        // efterlader aldrig en række uden slut-status
      }
    }
    return true;
  } catch (fejl) {
    console.error(
      `Trigger.dev afviste trial-jobbet (er "trial-pipeline" deployet med npx trigger.dev deploy?):`,
      fejl,
    );
    return false;
  }
}

/**
 * Start kørslen for en oprettet trial. Returnerer motoren, der reelt tog
 * kørslen, eller `false` — så skal kalderen markere rækken failed og svare
 * ærligt nu, aldrig lade den besøgende vente på et job, der ikke findes.
 *
 * I PRODUKTION er Netlify-baggrundsfunktionen førstevalget: den kræver
 * intet Trigger.dev-deploy, og dens 202-kvittering er utvetydig — hvor
 * Trigger.dev kan tage imod en kørsel, der aldrig starter. Trigger.dev er
 * anden vej (og tager over, hvis Netlify-kaldet fejler).
 */
export async function startTrial(
  trialId: string,
  originalSti: string,
): Promise<TrialMotor | false> {
  const kanKoereLokalt = processenOverleverKoerslen();

  if (!kanKoereLokalt && (await startViaNetlifyBaggrund(trialId, originalSti))) {
    return "netlify";
  }

  if (process.env.TRIGGER_SECRET_KEY && (await startViaTriggerDev(trialId, originalSti))) {
    return "trigger";
  }

  if (!kanKoereLokalt) {
    console.error(
      `Trial ${trialId}: hverken Netlify-baggrund eller Trigger.dev kunne starte kørslen — afvises ærligt`,
    );
    return false;
  }
  void koerOgGemTrial(opretServiceKlient(), trialId, originalSti).catch(() => {
    // Allerede logget og markeret failed i koerOgGemTrial
  });
  return "proces";
}
