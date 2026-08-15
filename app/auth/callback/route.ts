import { NextResponse, type NextRequest } from "next/server";
import { tilfoejSignupKreditter } from "@/lib/credits/ledger";
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
  if (data.user.user_metadata?.age_confirmed === true) {
    await service
      .from("profiles")
      .update({ age_confirmed: true })
      .eq("id", data.user.id);
  }
  await tilfoejSignupKreditter(new SupabaseLedgerDb(service), data.user.id);

  return NextResponse.redirect(new URL(videre, url.origin));
}
