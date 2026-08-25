// Trial-driften styres i ADMIN-PANELET, ikke i koden (samme princip som
// billedmodel-valg.ts): toggle "Gratis trial aktiv" + dagligt budgetloft i kr.
// bor i `indstillinger` under nøglen "trial" og slår igennem UDEN deploy.
//
// BEVIDST ingen cache (modsat modelvalget): "slås den fra, afvises nye trials
// ØJEBLIKKELIGT" er et ejer-krav, og trials er sjældne nok (maks 10/time) til
// at et friskt opslag pr. forsøg er gratis. Fejler opslaget, svarer vi null —
// trial-værnet er fejlsikret LUKKET (penge på spil), se lib/trial/vaern.ts.

import { trial } from "@/lib/config";

export const TRIAL_INDSTILLING_NOEGLE = "trial";

export type TrialIndstillinger = {
  aktiv: boolean;
  dagligtBudgetDkk: number;
};

export const STANDARD_TRIAL_INDSTILLINGER: TrialIndstillinger = {
  aktiv: true,
  dagligtBudgetDkk: trial.standardDagligtBudgetDkk,
};

/**
 * Indstillingerne fra databasen; standarderne når nøglen mangler (migrationen
 * er kørt, men admin har aldrig gemt). null KUN når databasen ikke kan svares
 * — kalderen afgør fejltilstanden (trial-værnet lukker, admin viser standard).
 */
export async function hentTrialIndstillinger(): Promise<TrialIndstillinger | null> {
  try {
    const { opretServiceKlient } = await import("@/lib/supabase/service");
    const { data, error } = await opretServiceKlient()
      .from("indstillinger")
      .select("vaerdi")
      .eq("noegle", TRIAL_INDSTILLING_NOEGLE)
      .maybeSingle();
    if (error) return null;
    const gemt = (data?.vaerdi ?? {}) as Partial<TrialIndstillinger>;
    return {
      aktiv:
        typeof gemt.aktiv === "boolean"
          ? gemt.aktiv
          : STANDARD_TRIAL_INDSTILLINGER.aktiv,
      dagligtBudgetDkk:
        typeof gemt.dagligtBudgetDkk === "number" && gemt.dagligtBudgetDkk >= 0
          ? gemt.dagligtBudgetDkk
          : STANDARD_TRIAL_INDSTILLINGER.dagligtBudgetDkk,
    };
  } catch {
    return null;
  }
}

export async function gemTrialIndstillinger(
  valg: TrialIndstillinger,
  opdateretAf: string,
): Promise<void> {
  const { opretServiceKlient } = await import("@/lib/supabase/service");
  const { error } = await opretServiceKlient()
    .from("indstillinger")
    .upsert(
      {
        noegle: TRIAL_INDSTILLING_NOEGLE,
        vaerdi: valg,
        opdateret_at: new Date().toISOString(),
        opdateret_af: opdateretAf,
      },
      { onConflict: "noegle" },
    );
  if (error) throw new Error(error.message);
}
