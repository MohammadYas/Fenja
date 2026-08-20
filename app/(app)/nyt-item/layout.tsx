import { redirect } from "next/navigation";
import { opretServerKlient } from "@/lib/supabase/server";

/**
 * Onboarding-gate (ejer-ordre 2026-08-20): personen på billederne skal være
 * valgt, FØR man laver en annonce — ellers genereres den første annonce med
 * en tilfældig person. Har sælgeren ikke valgt endnu, sendes han til
 * onboardingen med ?videre=/nyt-item, så han lander i wizarden bagefter
 * (i modsætning til banneret på oversigten, der fører tilbage dertil).
 *
 * Fejltolerant: kan profilen ikke læses (manglende migration, ingen auth i
 * konteksten), lader vi wizarden køre — en gate må aldrig spærre salget.
 */
export default async function NytItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let manglerOnboarding = false;
  try {
    const supabase = await opretServerKlient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      const { data: profil, error } = await supabase
        .from("profiles")
        .select("koen, age_confirmed")
        .eq("id", user.id)
        .maybeSingle();
      // Manglende 18+ tæller også: en Google-konto oprettet fra "log ind"-
      // fanen når aldrig alders-spørgsmålet, og A-2 gælder uanset vejen ind.
      manglerOnboarding =
        !error &&
        profil != null &&
        (!profil.koen || profil.age_confirmed !== true);
    }
  } catch {
    manglerOnboarding = false;
  }

  if (manglerOnboarding) {
    redirect("/onboarding?videre=%2Fnyt-item");
  }

  return <>{children}</>;
}
