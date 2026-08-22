import { NextResponse, type NextRequest } from "next/server";
import { koerEfterBekraeftelse } from "@/lib/auth/efter-bekraeftelse";
import { site } from "@/lib/config";
import { opretServerKlient } from "@/lib/supabase/server";

// OAuth/PKCE-callback (A-1): veksler koden til en session. Første succesfulde
// login ER e-mailverifikationen, så efterspillet (alder, kreditter,
// velkomstmail) kører i den fælles koerEfterBekraeftelse — idempotent, så
// gentagne logins er no-ops. Mail-links går IKKE her længere: de bruger
// token_hash-flowet i auth/confirm, som virker på tværs af browsere.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // Bag Netlify kan request-URL'ens host være det interne branch-domæne
  // (main--selja.netlify.app) — cookies gælder kun det domæne, brugeren ser.
  // I produktion redirectes derfor ALTID til den konfigurerede base-URL.
  const origin = process.env.NODE_ENV === "production" ? site.baseUrl : url.origin;
  const kode = url.searchParams.get("code");
  const videre = url.searchParams.get("videre") ?? "/oversigt";

  if (!kode) {
    return NextResponse.redirect(new URL("/log-ind", origin));
  }

  const supabase = await opretServerKlient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(kode);
  if (error || !data.user) {
    // Fejlet veksling (udløbet/forkert browser) → log ind-siden MED
    // forklaring i stedet for en tom login-væg (ejer 22/8)
    return NextResponse.redirect(new URL("/log-ind?besked=link-udloebet", origin));
  }

  // E-mail-signup bærer alderen i user_metadata; Google kan ikke bære
  // metadata gennem OAuth-flowet, så login-siden spørger FØR omdirigeringen
  // og sender svaret med som ?alder=1 (samme selvangivne tillid som feltet).
  await koerEfterBekraeftelse({
    userId: data.user.id,
    email: data.user.email,
    alderBekraeftet:
      data.user.user_metadata?.age_confirmed === true ||
      url.searchParams.get("alder") === "1",
    origin: origin,
  });

  const sikkerVidere = videre.startsWith("/") && !videre.startsWith("//") ? videre : "/oversigt";
  return NextResponse.redirect(new URL(sikkerVidere, origin));
}
