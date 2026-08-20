import { NextResponse, type NextRequest } from "next/server";
import { tilfoejSignupKreditter } from "@/lib/credits/ledger";
import { hentEmailAfsender } from "@/lib/emails/send";
import { bedstMuligt, sendVelkomst } from "@/lib/emails/notifikationer";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Magic link-callback (A-1): veksler koden til en session. Første succesfulde
// login ER e-mailverifikationen, så her bekræftes alder (A-2) og gratis-
// kreditterne tildeles (E-1/E-5) — idempotent, så gentagne logins er no-ops.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const kode = url.searchParams.get("code");
  const videre = url.searchParams.get("videre") ?? "/oversigt";

  if (!kode) {
    return NextResponse.redirect(new URL("/log-ind", url.origin));
  }

  const supabase = await opretServerKlient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(kode);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/log-ind", url.origin));
  }

  const service = opretServiceKlient();
  // E-mail-signup bærer alderen i user_metadata; Google/Apple kan ikke bære
  // metadata gennem OAuth-flowet, så login-siden spørger FØR omdirigeringen
  // og sender svaret med som ?alder=1 (samme selvangivne tillid som feltet).
  const alderBekraeftet =
    data.user.user_metadata?.age_confirmed === true ||
    url.searchParams.get("alder") === "1";
  if (alderBekraeftet) {
    await service
      .from("profiles")
      .update({ age_confirmed: true })
      .eq("id", data.user.id);
  }
  await tilfoejSignupKreditter(new SupabaseLedgerDb(service), data.user.id);

  // S32: velkomstmail én gang pr. bruger (welcomed_at-guard). Kører best-effort
  // efter login er sikret — en fejlet mail må aldrig blokere adgangen.
  await bedstMuligt(async () => {
    const bruger = data.user;
    if (!bruger.email) return;
    const { data: profil } = await service
      .from("profiles")
      .select("welcomed_at")
      .eq("id", bruger.id)
      .maybeSingle();
    if (!profil || (profil.welcomed_at as string | null) != null) return;
    await sendVelkomst(hentEmailAfsender(), {
      til: bruger.email,
      startUrl: new URL("/nyt-item", url.origin).toString(),
    });
    // Sæt først EFTER en bekræftet afsendelse — fejler mailen, prøves den igen
    await service
      .from("profiles")
      .update({ welcomed_at: new Date().toISOString() })
      .eq("id", bruger.id);
  });

  return NextResponse.redirect(new URL(videre, url.origin));
}
