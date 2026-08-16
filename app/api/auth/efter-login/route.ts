import { NextResponse } from "next/server";
import { tilfoejSignupKreditter } from "@/lib/credits/ledger";
import { hentEmailAfsender } from "@/lib/emails/send";
import { bedstMuligt, sendVelkomst } from "@/lib/emails/notifikationer";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Kaldes af login-siden efter en succesfuld adgangskode-login eller -oprettelse
// (A-1 er nu traditionelt login, ikke magic link). Sætter alders-flaget (A-2),
// tildeler signup-kreditter (E-1, p.t. no-op) og sender velkomstmailen én gang
// (S32, welcomed_at-guard) — alt idempotent og best-effort, så en fejl her
// aldrig spærrer en bruger der allerede er logget ind.
export async function POST() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const service = opretServiceKlient();

  if (user.user_metadata?.age_confirmed === true) {
    await service
      .from("profiles")
      .update({ age_confirmed: true })
      .eq("id", user.id);
  }

  await tilfoejSignupKreditter(new SupabaseLedgerDb(service), user.id);

  await bedstMuligt(async () => {
    if (!user.email) return;
    const { data: profil } = await service
      .from("profiles")
      .select("welcomed_at")
      .eq("id", user.id)
      .maybeSingle();
    if (!profil || (profil.welcomed_at as string | null) != null) return;
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await sendVelkomst(hentEmailAfsender(), {
      til: user.email,
      startUrl: new URL("/nyt-item", base).toString(),
    });
    await service
      .from("profiles")
      .update({ welcomed_at: new Date().toISOString() })
      .eq("id", user.id);
  });

  return NextResponse.json({ ok: true });
}
