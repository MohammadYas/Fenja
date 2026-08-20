import { opretServerKlient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

// Saldo/profil skal være frisk — siden må ikke caches
export const dynamic = "force-dynamic";

/**
 * Onboarding: køn + hårfarve, og for Google-konti også 18+-bekræftelsen.
 *
 * Hullet (fundet 20/8 i data): OAuth kan ikke skelne "log ind" fra "opret",
 * så en helt ny bruger, der trykker Google på log ind-fanen, fik oprettet en
 * konto UDEN nogensinde at få alders-spørgsmålet — `age_confirmed` blev
 * stående false. Her fanges de, før de kan lave en annonce (A-2).
 */
export default async function Onboarding() {
  let kraeverAlder = false;
  try {
    const supabase = await opretServerKlient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      const { data: profil, error } = await supabase
        .from("profiles")
        .select("age_confirmed")
        .eq("id", user.id)
        .maybeSingle();
      kraeverAlder = !error && profil != null && profil.age_confirmed !== true;
    }
  } catch {
    // Kan profilen ikke læses, spørger vi ikke — gaten på /nyt-item fanger det
    kraeverAlder = false;
  }

  return <OnboardingForm kraeverAlder={kraeverAlder} />;
}
