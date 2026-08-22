import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { koerEfterBekraeftelse } from "@/lib/auth/efter-bekraeftelse";
import { site } from "@/lib/config";
import { opretServerKlient } from "@/lib/supabase/server";

// Bekræftelses-callback via token_hash (21/8): mail-linkene peger HER i
// stedet for på PKCE-flowets ConfirmationURL. PKCE kræver at linket åbnes i
// SAMME browser som signup'en — det knækker for alle, der opretter sig i én
// browser og åbner mailen i en anden (typisk telefonen). verifyOtp med
// token_hash virker på tværs af enheder og sætter sessionen som cookies.
const TILLADTE_TYPER: readonly EmailOtpType[] = ["signup", "recovery", "email_change", "email"];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // Bag Netlify kan request-URL'ens host være det interne branch-domæne
  // (main--selja.netlify.app) — cookies gælder kun det domæne, brugeren ser.
  // I produktion redirectes derfor ALTID til den konfigurerede base-URL.
  const origin = process.env.NODE_ENV === "production" ? site.baseUrl : url.origin;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const kode = url.searchParams.get("code");
  // Nulstilling SKAL ende på ny-adgangskode-siden, også hvis mail-skabelonen
  // ikke sender videre-parameteren med (glemt-kode-fejlen 22/8)
  const videre =
    url.searchParams.get("videre") ??
    (type === "recovery" ? "/ny-adgangskode" : "/oversigt");

  const supabase = await opretServerKlient();
  let bruger: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;

  if (tokenHash && type && TILLADTE_TYPER.includes(type)) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error && data.user) bruger = data.user;
  } else if (kode) {
    // Fallback (glemt-kode-fejlen 22/8): peger mail-skabelonen stadig på
    // ConfirmationURL, kommer linket retur som PKCE-?code i stedet for
    // token_hash. Veksl den her, så flowet virker i afsender-browseren,
    // mens skabelonen lægges om (docs/supabase-mail-skabeloner.md).
    const { data, error } = await supabase.auth.exchangeCodeForSession(kode);
    if (!error && data.user) bruger = data.user;
  }

  if (!bruger) {
    // Udløbet/brugt link (dobbeltklik, mail-scanner der har "klikket" først)
    // → log ind-siden MED forklaring, ikke en tom login-væg (ejer 22/8:
    // besværlig indgang dræner omsætning). Er kontoen allerede bekræftet af
    // scanneren, virker et almindeligt login med det samme.
    return NextResponse.redirect(new URL("/log-ind?besked=link-udloebet", origin));
  }

  // Kun interne stier — aldrig eksterne redirects fra et mail-link
  const sikkerVidere = videre.startsWith("/") && !videre.startsWith("//") ? videre : "/oversigt";

  await koerEfterBekraeftelse({
    userId: bruger.id,
    email: bruger.email,
    alderBekraeftet: bruger.user_metadata?.age_confirmed === true,
    origin: origin,
  });

  return NextResponse.redirect(new URL(sikkerVidere, origin));
}
