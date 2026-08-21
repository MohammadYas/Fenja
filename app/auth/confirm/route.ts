import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { koerEfterBekraeftelse } from "@/lib/auth/efter-bekraeftelse";
import { opretServerKlient } from "@/lib/supabase/server";

// Bekræftelses-callback via token_hash (21/8): mail-linkene peger HER i
// stedet for på PKCE-flowets ConfirmationURL. PKCE kræver at linket åbnes i
// SAMME browser som signup'en — det knækker for alle, der opretter sig i én
// browser og åbner mailen i en anden (typisk telefonen). verifyOtp med
// token_hash virker på tværs af enheder og sætter sessionen som cookies.
const TILLADTE_TYPER: readonly EmailOtpType[] = ["signup", "recovery", "email_change", "email"];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const videre = url.searchParams.get("videre") ?? "/oversigt";

  if (!tokenHash || !type || !TILLADTE_TYPER.includes(type)) {
    return NextResponse.redirect(new URL("/log-ind", url.origin));
  }

  const supabase = await opretServerKlient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) {
    // Udløbet/brugt link → log ind-siden (ny-adgangskode-siden forklarer selv
    // "linket er udløbet", hvis det var en nulstilling)
    return NextResponse.redirect(new URL("/log-ind", url.origin));
  }

  // Kun interne stier — aldrig eksterne redirects fra et mail-link
  const sikkerVidere = videre.startsWith("/") && !videre.startsWith("//") ? videre : "/oversigt";

  await koerEfterBekraeftelse({
    userId: data.user.id,
    email: data.user.email,
    alderBekraeftet: data.user.user_metadata?.age_confirmed === true,
    origin: url.origin,
  });

  return NextResponse.redirect(new URL(sikkerVidere, url.origin));
}
