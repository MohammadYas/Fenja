"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-klient: kun anon-nøgle, RLS beskytter data (NFR-6).
export function opretBrowserKlient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
