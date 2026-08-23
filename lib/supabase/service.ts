import "server-only";

import { createClient } from "@supabase/supabase-js";

import { fetchMedTidsgraense } from "./tidsgraense";

// Service-klient (omgår RLS) — KUN til server/jobs: webhooks, pipeline,
// kontosletning. Må aldrig importeres fra klientkode ("server-only" håndhæver det).
export function opretServiceKlient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !noegle) {
    throw new Error(
      "Supabase service-miljøvariabler mangler (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  return createClient(url, noegle, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Hård tidsgrænse på alle rundture (23/8) — et hængende kald må aldrig
    // holde en side eller et job som gidsel
    global: { fetch: fetchMedTidsgraense() },
  });
}
