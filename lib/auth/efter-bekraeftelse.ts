// Fælles efterspil når en bruger har bekræftet sig (magic link/OAuth-kode i
// auth/callback ELLER token_hash i auth/confirm): alder sættes, evt.
// signup-kreditter tildeles, og velkomstmailen sendes én gang. Alt er
// idempotent, så gentagne logins er no-ops.

import { tilfoejSignupKreditter } from "@/lib/credits/ledger";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { bedstMuligt, sendVelkomst } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { opretServiceKlient } from "@/lib/supabase/service";

export async function koerEfterBekraeftelse(args: {
  userId: string;
  email: string | null | undefined;
  alderBekraeftet: boolean;
  origin: string;
}): Promise<void> {
  const service = opretServiceKlient();
  if (args.alderBekraeftet) {
    await service
      .from("profiles")
      .update({ age_confirmed: true })
      .eq("id", args.userId);
  }
  await tilfoejSignupKreditter(new SupabaseLedgerDb(service), args.userId);

  // S32: velkomstmail én gang pr. bruger (welcomed_at-guard). Best-effort —
  // en fejlet mail må aldrig blokere adgangen.
  await bedstMuligt(async () => {
    if (!args.email) return;
    const { data: profil } = await service
      .from("profiles")
      .select("welcomed_at")
      .eq("id", args.userId)
      .maybeSingle();
    if (!profil || (profil.welcomed_at as string | null) != null) return;
    await sendVelkomst(hentEmailAfsender(), {
      til: args.email,
      startUrl: new URL("/nyt-item", args.origin).toString(),
    });
    // Sættes først EFTER en bekræftet afsendelse — fejler mailen, prøves igen
    await service
      .from("profiles")
      .update({ welcomed_at: new Date().toISOString() })
      .eq("id", args.userId);
  });
}
