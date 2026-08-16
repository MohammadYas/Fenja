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

  const kraeverLogin = BESKYTTEDE_PRAEFIKSER.some((praefiks) =>
    request.nextUrl.pathname.startsWith(praefiks),
  );

  if (kraeverLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/log-ind";
    url.searchParams.set("videre", request.nextUrl.pathname);
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
