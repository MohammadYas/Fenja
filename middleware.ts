import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Fornyer Supabase-sessionen på hver request (A-5: sessionen overlever
// app-genstart på mobil) og beskytter app-ruterne.
const BESKYTTEDE_PRAEFIKSER = [
  "/oversigt",
  "/items",
  "/nyt-item",
  "/kreditter",
  "/konto",
  "/suppliers",
  "/admin",
];

export async function middleware(request: NextRequest) {
  let respons = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonNoegle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Uden Supabase-env (build-preview, lokal kig på marketing-sider) gør
  // middleware ingenting — app-siderne håndhæver selv login.
  if (!url || !anonNoegle) return respons;

  const kraeverLoginSti = BESKYTTEDE_PRAEFIKSER.some((praefiks) =>
    request.nextUrl.pathname.startsWith(praefiks),
  );

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (kraeverLoginSti && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/log-ind";
    url.searchParams.set("videre", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Auto-login (ejer-ordre 2026-08-20): sessionen fornyes ovenfor og overlever
  // både genstart og lukket browser, så en bruger der allerede ER logget ind
  // skal aldrig se login-formularen igen — han sendes direkte videre.
  if (user && request.nextUrl.pathname === "/log-ind") {
    const url = request.nextUrl.clone();
    const videre = request.nextUrl.searchParams.get("videre");
    // Kun interne stier — en åben omdirigering må aldrig kunne smugles ind
    url.pathname = videre?.startsWith("/") && !videre.startsWith("//")
      ? videre
      : "/oversigt";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return respons;
}

export const config = {
  matcher: [
    // Alt undtagen statiske filer og Next-interne stier
    "/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
