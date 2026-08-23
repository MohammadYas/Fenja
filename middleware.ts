import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { erBeskyttetSti, sikkerVidereSti } from "@/lib/auth/ruter";
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
  let user: { id: string } | null = null;
  let authFejlede = false;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    authFejlede = true;
  }

  if (kraeverLoginSti && !user && !authFejlede) {
    const til = request.nextUrl.clone();
    til.pathname = "/log-ind";
    til.search = "";
    til.searchParams.set("videre", request.nextUrl.pathname);
    return NextResponse.redirect(til);
  }

  // Auto-login (ejer-ordre 2026-08-20): sessionen fornyes ovenfor og overlever
  // både genstart og lukket browser, så en bruger der allerede ER logget ind
  // skal aldrig se login-formularen igen — han sendes direkte videre.
  if (user && request.nextUrl.pathname === "/log-ind") {
    const til = request.nextUrl.clone();
    til.pathname = sikkerVidereSti(request.nextUrl.searchParams.get("videre"));
    til.search = "";
    return NextResponse.redirect(til);
  }

  return respons;
}

export const config = {
  matcher: [
    // Alt undtagen statiske filer og Next-interne stier
    "/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
