import "server-only";

// Start af trial-kørslen — samme mønster som lib/pipeline/start.ts: med
// Trigger.dev-nøgle kører jobbet dér (Netlify-functions må ikke bære et
// 60-sekunders provider-kald); uden nøgle køres i processen (lokal udvikling).
// Fejl fanges i koerOgGemTrial, som altid efterlader rækken i en slut-status.
//
// PROD-HÆNDELSE 26/8: den tidligere "kør i processen"-fallback i produktion
// var en fælde. Netlify fryser funktionen i samme øjeblik svaret er sendt, så
// kørslen døde stille, rækken stod i "running", og HVER besøgende så minutters
// falsk fremdrift efterfulgt af en fejl (verificeret mod prod: rækken flippede
// aldrig selv — kun status-rutens høster afgjorde den efter 3 minutter).
// Derfor: kan kørslen ikke afleveres til Trigger.dev, og overlever processen
// ikke (produktion på Netlify), svarer vi ærligt NEJ med det samme — kalderen
// markerer trialen failed, og den besøgende får en øjeblikkelig, ærlig fejl.

import { opretServiceKlient } from "@/lib/supabase/service";
import { koerOgGemTrial } from "./koersel";

/** In-process overlever kun i en langtidslevende proces: `next dev` og
 *  mock-demoer. På Netlify (production-build) fryses processen efter svaret. */
function processenOverleverKoerslen(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.MOCK_PROVIDERS === "1";
}

/**
 * Start kørslen for en oprettet trial. `true` = kørslen ER reelt i gang
 * (Trigger.dev eller en overlevende lokal proces). `false` = intet blev
 * startet — kalderen skal markere rækken failed og svare ærligt nu, aldrig
 * lade den besøgende vente på et job, der ikke findes.
 */
export async function startTrial(trialId: string, originalSti: string): Promise<boolean> {
  if (process.env.TRIGGER_SECRET_KEY) {
    try {
      const { tasks } = await import("@trigger.dev/sdk");
      await tasks.trigger("trial-pipeline", { trialId, originalSti });
      return true;
    } catch (fejl) {
      console.error(
        `Trigger.dev afviste trial-jobbet (er "trial-pipeline" deployet med npx trigger.dev deploy?):`,
        fejl,
      );
      if (!processenOverleverKoerslen()) return false;
    }
  } else if (!processenOverleverKoerslen()) {
    console.error(
      "TRIGGER_SECRET_KEY mangler, og in-process-kørsel dør på Netlify — trialen afvises ærligt",
    );
    return false;
  }
  void koerOgGemTrial(opretServiceKlient(), trialId, originalSti).catch(() => {
    // Allerede logget og markeret failed i koerOgGemTrial
  });
  return true;
}
