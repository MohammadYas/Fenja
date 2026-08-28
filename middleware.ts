import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hentBrugerTilstand } from "@/lib/auth/bruger";
import {
  erBeskyttetSti,
  erLogIndSti,
  maaBrugeCookieGenvej,
  sikkerVidereSti,
} from "@/lib/auth/ruter";
import { authCookieNavne, sessionErFrisk } from "@/lib/auth/session-cookie";
import {
  MIDDLEWARE_TIDSGRAENSE_MS,
  fetchMedTidsgraense,
} from "@/lib/supabase/tidsgraense";

// Fornyer Supabase-sessionen på hver request (A-5: sessionen overlever
// app-genstart på mobil) og beskytter app-ruterne.
//
// ROBUSTHED (ejer-rapport 23/8 aften, "the edge function timed out"): auth-
// kaldet her stod mellem HVERT request fra en indlogget bruger og HELE sitet
// — hang kaldet, hang alt, også marketing-siderne. Nu har kaldet en hård
// tidsgrænse, og fejler det, LUKKES brugeren IGENNEM i stedet for at vælte
// requestet: app-siderne håndhæver selv login, så fail-open er sikkert.

export async function middleware(request: NextRequest) {
  let respons = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonNoegle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Uden Supabase-env (build-preview, lokal kig på marketing-sider) gør
  // middleware ingenting — app-siderne håndhæver selv login.
  if (!url || !anonNoegle) return respons;

  const kraeverLoginSti = erBeskyttetSti(request.nextUrl.pathname);

  // Hastighed (ejer 22/8: "siden føles langsom fra menu til menu"): auth-
  // roundtrippet til Supabase kostede på HVERT klik — også for anonyme
  // besøgende på statiske marketing-sider. Uden auth-cookies er der ingen
  // session at forny: spring netkaldet helt over, og send beskyttede ruter
  // direkte til log ind.
  const harAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));
  if (!harAuthCookie) {
    if (kraeverLoginSti) {
      const til = request.nextUrl.clone();
      til.pathname = "/log-ind";
      til.search = "";
      til.searchParams.set("videre", request.nextUrl.pathname);
      return NextResponse.redirect(til);
    }
    return respons;
  }

  // Hastighed (ejer 23/8 aften: "den loader så langsomt"): en indlogget
  // bruger betalte en auth-rundtur på HVERT klik — og på en dårlig dag hos
  // Netlify→Supabase blev hvert klik til sekunders venten på tidsgrænsen.
  // Middlewarens opgave er kun at FORNY sessionen før udløb: er der læseligt
  // lang tid til udløb i cookien, er der intet at forny, og netkaldet
  // springes over. Autorisationen ligger stadig 100 % hos siderne selv.
  //
  // MEN aldrig på log ind-siden (ejer-rapport: "kan ikke logge ind"): cookien
  // er ubekræftet, og sendte vi brugeren videre på den alene, kunne en DØD
  // cookie (session tilbagekaldt, projekt skiftet, konto slettet) lukke
  // login-siden helt: appen sagde "log ind", cookien sagde "du er logget
  // ind", og browseren gav op med for mange omdirigeringer. Vejen VÆK fra
  // login kræver derfor et rigtigt svar fra Supabase — det koster én
  // rundtur på en side, man besøger sjældent, og aldrig noget inde i appen.
  const paaLogInd = erLogIndSti(request.nextUrl.pathname);
  if (
    maaBrugeCookieGenvej(request.nextUrl.pathname) &&
    sessionErFrisk(request.cookies.getAll())
  ) {
    return respons;
  }

  const supabase = createServerClient(
    url,
    anonNoegle,
    {
      // Tidsgrænsen er hele fixet: et hængende kald må aldrig igen kunne
      // holde requestet (og dermed sitet) som gidsel til edge-timeouten
      global: { fetch: fetchMedTidsgraense(MIDDLEWARE_TIDSGRAENSE_MS) },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          respons = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            respons.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // To slags "ingen bruger": et RIGTIGT nej fra Supabase (udløbet/ugyldig
  // session → redirect til log-ind) og et kald der FEJLEDE (timeout, netværk
  // → fail-open, siden afgør selv). De må ikke behandles ens: fejlede kald
  // ville ellers logge alle ud, hver gang Supabase hikker.
  //
  // RETTET (ejer-rapport: "kan ikke logge ind"): skelnen lå før i et
  // try/catch — men supabase-js KASTER ikke ved timeout og netværksfejl, den
  // returnerer fejlen i `error`. Fail-open'en udløste derfor i praksis
  // aldrig: hvert eneste hik hos Netlify→Supabase blev læst som "ingen
  // bruger" og smed en indlogget bruger ud på login-væggen. Fejlen aflæses
  // nu, hvor den faktisk står (hentBrugerTilstand).
  const { bruger: user, fejlede: authFejlede } =
    await hentBrugerTilstand(supabase);

  // Supabase har svaret et rigtigt nej: sessionen er væk eller ugyldig.
  const doedSession = !user && !authFejlede;

  if (kraeverLoginSti && doedSession) {
    const til = request.nextUrl.clone();
    til.pathname = "/log-ind";
    til.search = "";
    til.searchParams.set("videre", request.nextUrl.pathname);
    // Ærligt hvorfor (ejer 22/8: ingen tomme login-vægge) — han HAVDE en
    // session, den er bare udløbet
    til.searchParams.set("besked", "session-udloebet");
    return NextResponse.redirect(til);
  }

  // Auto-login (ejer-ordre 2026-08-20): sessionen fornyes ovenfor og overlever
  // både genstart og lukket browser, så en bruger der allerede ER logget ind
  // skal aldrig se login-formularen igen — han sendes direkte videre.
  if (user && paaLogInd) {
    const til = request.nextUrl.clone();
    til.pathname = sikkerVidereSti(request.nextUrl.searchParams.get("videre"));
    til.search = "";
    return NextResponse.redirect(til);
  }

  // Nødudgangen: står vi PÅ log ind-siden med en cookie, Supabase lige har
  // afvist, er cookien død — og en død cookie er præcis det, der før kunne
  // sende brugeren i ring. Den slettes her, ét sted, efter et rigtigt svar:
  // næste request går den cookieløse hurtige vej, og formularen virker.
  // Kun selve token-cookien rammes — PKCE'ens code-verifier skal overleve et
  // igangværende Google-login. Slettes bevidst IKKE på app-siderne: et tabt
  // kapløb mellem to samtidige fornyelser ville ellers smide en bruger ud,
  // som en anden fane netop har forsynet med en frisk session.
  if (paaLogInd && doedSession) {
    for (const navn of authCookieNavne(request.cookies.getAll())) {
      respons.cookies.delete(navn);
    }
  }

  return respons;
}

export const config = {
  matcher: [
    // Alt undtagen statiske filer og Next-interne stier
    "/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
