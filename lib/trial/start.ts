import "server-only";

// Start af trial-kørslen — samme mønster som lib/pipeline/start.ts: med
// Trigger.dev-nøgle kører jobbet dér (Netlify-functions må ikke bære et
// 60-sekunders provider-kald); uden nøgle køres i processen (lokal udvikling).
// Fejl fanges i koerOgGemTrial, som altid efterlader rækken i en slut-status.
//
// Robusthed (25/8): er trial-jobbet endnu ikke deployet til Trigger.dev
// (kendt hul mellem git-push og næste `npx trigger.dev deploy`), må trialen
// ikke dø med en 500 eller stå i evigt "running" — så falder vi tilbage til
// kørsel i processen. Klientens 4-minutters loft viser en ærlig fejl, hvis
// Netlify fryser processen undervejs.

import { opretServiceKlient } from "@/lib/supabase/service";
import { koerOgGemTrial } from "./koersel";

export async function startTrial(trialId: string, originalSti: string): Promise<void> {
  if (process.env.TRIGGER_SECRET_KEY) {
    try {
      const { tasks } = await import("@trigger.dev/sdk");
      await tasks.trigger("trial-pipeline", { trialId, originalSti });
      return;
    } catch (fejl) {
      console.error(
        `Trigger.dev afviste trial-jobbet (er "trial-pipeline" deployet?) — kører i processen:`,
        fejl,
      );
    }
  }
  void koerOgGemTrial(opretServiceKlient(), trialId, originalSti).catch(() => {
    // Allerede logget og markeret failed i koerOgGemTrial
  });
}
