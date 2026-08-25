import "server-only";

// Start af trial-kørslen — samme mønster som lib/pipeline/start.ts: med
// Trigger.dev-nøgle kører jobbet dér (Netlify-functions må ikke bære et
// 60-sekunders provider-kald); uden nøgle køres i processen (lokal udvikling).
// Fejl fanges i koerOgGemTrial, som altid efterlader rækken i en slut-status.

import { opretServiceKlient } from "@/lib/supabase/service";
import { koerOgGemTrial } from "./koersel";

export async function startTrial(trialId: string, originalSti: string): Promise<void> {
  if (process.env.TRIGGER_SECRET_KEY) {
    const { tasks } = await import("@trigger.dev/sdk");
    await tasks.trigger("trial-pipeline", { trialId, originalSti });
    return;
  }
  void koerOgGemTrial(opretServiceKlient(), trialId, originalSti).catch(() => {
    // Allerede logget og markeret failed i koerOgGemTrial
  });
}
