// Hvilken billedmodel brugerne kører på — ejer-ordre 2026-08-23: valget
// træffes i admin-panelet, ikke i koden. Kataloget over godkendte modeller
// står i lib/config.ts (billedModeller); HER bor kun selve valget pr. formål,
// gemt i tabellen `indstillinger` under nøglen "billedmodel".
//
// Robusthed før finesse (bulletproof-reglen): fejler opslaget — migrationen
// er ikke kørt, nøglerne mangler, databasen er nede — bruges standardvalget
// fra config i stedet for at vælte pipelinen. Et forkert valgt (men gyldigt)
// modelvalg er uendeligt bedre end en tabt leverance.

import {
  billedModelEllerStandard,
  standardBilledModel,
  type BilledFormaal,
  type BilledModel,
} from "@/lib/config";

export const INDSTILLING_NOEGLE = "billedmodel";

export type ModelValg = Record<BilledFormaal, string>;

const FORMAAL: readonly BilledFormaal[] = ["preview", "final"];
// Pipelinen kan køre 4 billeder parallelt pr. annonce — uden cache ville hvert
// kald slå op i databasen. 30 sekunder er kort nok til at et skift i admin
// slår igennem med det samme i praksis.
const CACHE_MS = 30_000;

let cache: { valg: ModelValg; tid: number } | null = null;

/** Tømmer cachen — kaldes efter admin gemmer, og fra tests */
export function nulstilModelValgCache(): void {
  cache = null;
}

export async function hentModelValg(): Promise<ModelValg> {
  if (cache && Date.now() - cache.tid < CACHE_MS) return cache.valg;

  const valg: ModelValg = { ...standardBilledModel };
  try {
    const { opretServiceKlient } = await import("@/lib/supabase/service");
    const { data } = await opretServiceKlient()
      .from("indstillinger")
      .select("vaerdi")
      .eq("noegle", INDSTILLING_NOEGLE)
      .maybeSingle();
    const gemt = (data?.vaerdi ?? {}) as Partial<ModelValg>;
    for (const formaal of FORMAAL) {
      const id = gemt[formaal];
      if (typeof id === "string" && id) valg[formaal] = id;
    }
  } catch {
    // Standarden gælder — se filens hoved
  }

  cache = { valg, tid: Date.now() };
  return valg;
}

/** Aldrig null: ukendt id i databasen falder tilbage til standarden */
export async function hentValgtModel(formaal: BilledFormaal): Promise<BilledModel> {
  const valg = await hentModelValg();
  return billedModelEllerStandard(valg[formaal], formaal);
}

export async function gemModelValg(valg: ModelValg, opdateretAf: string): Promise<void> {
  const { opretServiceKlient } = await import("@/lib/supabase/service");
  const { error } = await opretServiceKlient()
    .from("indstillinger")
    .upsert(
      {
        noegle: INDSTILLING_NOEGLE,
        vaerdi: valg,
        opdateret_at: new Date().toISOString(),
        opdateret_af: opdateretAf,
      },
      { onConflict: "noegle" },
    );
  if (error) throw new Error(error.message);
  nulstilModelValgCache();
}
