// Natlig oprydning af trial-fotos (auto-sletning efter 7 dage, ejer-krav 9).
// Kører som planlagt Trigger.dev-job og bruger Storage-API'et — Supabase
// BLOKERER direkte SQL-sletning i storage.objects (storage.protect_delete,
// fundet 25/8), så pg_cron kan kun rydde selve trial_usage-rækkerne.
// Claim efter de 7 dage overlever: teksten claimes stadig, kun billederne
// er væk — det er præcis hvad privatlivsløftet på /prov siger.

import { schedules } from "@trigger.dev/sdk";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "trial-photos";

export const trialOprydning = schedules.task({
  id: "trial-oprydning",
  cron: "15 3 * * *",
  run: async () => {
    const klient = opretServiceKlient();
    const graense = new Date(Date.now() - 7 * 86_400_000).toISOString();

    const { data, error } = await klient
      .from("trial_usage")
      .select("id, original_sti, billede_sti, vandmaerket_sti")
      .lt("created_at", graense)
      .or("original_sti.not.is.null,billede_sti.not.is.null,vandmaerket_sti.not.is.null")
      .limit(500);
    if (error) throw new Error(`Oprydningsopslag fejlede: ${error.message}`);

    let slettede = 0;
    for (const raekke of data ?? []) {
      const stier = [raekke.original_sti, raekke.billede_sti, raekke.vandmaerket_sti]
        .filter((sti): sti is string => !!sti);
      if (stier.length > 0) {
        const { error: fjernFejl } = await klient.storage.from(BUCKET).remove(stier);
        if (fjernFejl) {
          console.error(`Kunne ikke slette filer for trial ${raekke.id}:`, fjernFejl.message);
          continue; // stierne beholdes, så næste nat prøver igen
        }
        slettede += stier.length;
      }
      await klient
        .from("trial_usage")
        .update({ original_sti: null, billede_sti: null, vandmaerket_sti: null })
        .eq("id", raekke.id);
    }
    return { trials: (data ?? []).length, filerSlettet: slettede };
  },
});
