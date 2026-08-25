import { NextResponse, type NextRequest } from "next/server";
import { trial } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { opretServiceKlient } from "@/lib/supabase/service";
import { hentTrialViaTokenHash } from "@/lib/trial/db";
import { trialTokenHash } from "@/lib/trial/vaern";

// Polling under trial-genereringen (samme mønster som items/[id]/status):
// tokenet fra POST /api/prov er adgangen — anonyme kan KUN se deres egen
// trial, og et 128-bit tilfældigt token kan ikke gættes. Rate limit mod
// token-fisketure alligevel (OWASP API4).
export async function GET(request: NextRequest) {
  const graense = await tjekRateLimit("prov-status", klientNoegle(request), 240, 3600);
  if (!graense.tilladt) return forMangeKald(graense.nulstillerOm);

  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ fejl: da.prov.fejlFindesIkke }, { status: 404 });
  }
  const raekke = await hentTrialViaTokenHash(opretServiceKlient(), trialTokenHash(token));
  if (!raekke) {
    return NextResponse.json({ fejl: da.prov.fejlFindesIkke }, { status: 404 });
  }

  return NextResponse.json({
    status: raekke.status,
    startetAt: raekke.created_at,
    // Forventningen matcher trialens 60-sekunders loft, ikke den betalte pipeline
    forventetSekunder: Math.round(trial.timeoutMs / 1000),
  });
}
