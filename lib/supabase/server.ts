import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-klient til server components og route handlers — kører som den
// indloggede bruger (RLS gælder). Sessionen bæres i cookies (A-5).
export async function opretServerKlient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Kald fra en server component uden respons — middleware fornyer sessionen
          }
        },
      },
    },
  );
}
