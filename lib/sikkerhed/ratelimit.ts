import "server-only";

// Rate limiting på offentlige endepunkter (OWASP API4:2023 — Unrestricted
// Resource Consumption). Tælleren bor i databasen, ikke i hukommelsen:
// Netlify-functions er statsløse og skalerer vandret, så en process-lokal
// Map ville kunne omgås ved blot at ramme en anden instans.
//
// Nøglen er (rute + identitet), hvor identiteten er bruger-id når man er
// logget ind, ellers en HASHET klient-IP. Vi gemmer ALDRIG rå IP —
// privatlivspolitikken lover det modsatte, og hashen er nok til at tælle.
//
// Fejler tælleren (DB nede), lukker vi IGENNEM i stedet for at afvise: en
// nedbrudt tæller må ikke tage hele appen med sig. Det er et bevidst valg —
// misbrugsværnene på penge og kreditter ligger i ledgeren, ikke her.

import { createHash } from "node:crypto";
import { opretServiceKlient } from "@/lib/supabase/service";

export type RateLimitSvar = {
  tilladt: boolean;
  /** Sekunder til vinduet nulstilles — bruges i Retry-After */
  nulstillerOm: number;
};

/** Klientens identitet: bruger-id hvis kendt, ellers hashet IP */
export function klientNoegle(request: Request, userId?: string | null): string {
  if (userId) return `bruger:${userId}`;
  // Netlify/Vercel sætter x-forwarded-for; første adresse er klienten
  const raa =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "ukendt";
  // Kun de første 16 tegn af hashen — nok til at tælle, umuligt at gå tilbage
  return `ip:${createHash("sha256").update(raa).digest("hex").slice(0, 16)}`;
}

/**
 * Tæller ét kald og svarer, om det er tilladt. Vinduet er glidende pr.
 * `vinduerSekunder`, implementeret som tælling af rækker i tabellen
 * `rate_limit` inden for vinduet.
 */
export async function tjekRateLimit(
  rute: string,
  noegle: string,
  maks: number,
  vinduerSekunder: number,
): Promise<RateLimitSvar> {
  try {
    const service = opretServiceKlient();
    const siden = new Date(Date.now() - vinduerSekunder * 1000).toISOString();

    const { count } = await service
      .from("rate_limit")
      .select("id", { count: "exact", head: true })
      .eq("rute", rute)
      .eq("noegle", noegle)
      .gte("created_at", siden);

    if ((count ?? 0) >= maks) {
      return { tilladt: false, nulstillerOm: vinduerSekunder };
    }
    await service.from("rate_limit").insert({ rute, noegle });
    return { tilladt: true, nulstillerOm: vinduerSekunder };
  } catch {
    // Fejlsikret ÅBEN: en nedbrudt tæller må ikke lukke appen ned
    return { tilladt: true, nulstillerOm: vinduerSekunder };
  }
}

/** Standardsvar ved for mange kald — med Retry-After, som HTTP foreskriver */
export function forMangeKald(nulstillerOm: number): Response {
  return new Response(
    JSON.stringify({
      fejl: "For mange forsøg. Prøv igen om lidt.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(nulstillerOm),
      },
    },
  );
}
