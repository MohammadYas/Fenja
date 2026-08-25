import { NextResponse, type NextRequest } from "next/server";
import { trial } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { opretServiceKlient } from "@/lib/supabase/service";
import { hentTrialViaTokenHash } from "@/lib/trial/db";
import { erTrialHaengende, trialTokenHash } from "@/lib/trial/vaern";

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
  const service = opretServiceKlient();
  const raekke = await hentTrialViaTokenHash(service, trialTokenHash(token));
  if (!raekke) {
    return NextResponse.json({ fejl: da.prov.fejlFindesIkke }, { status: 404 });
  }

  // Høsteren (kodereview 25/8): en kørsel ud over loftet + margin er reelt
  // død (frosset proces) — markér failed, så rækken aldrig står i evigt
  // "running" og admin-tallene stemmer. Pollingen udløser selv høsten.
  let status = raekke.status;
  if (status === "running" && erTrialHaengende(raekke.created_at)) {
    await service
      .from("trial_usage")
      .update({ status: "failed", fejl: "kørslen svarede aldrig (høstet af status-ruten)" })
      .eq("id", raekke.id)
      .eq("status", "running");
    status = "failed";
  }

  return NextResponse.json({
    status,
    startetAt: raekke.created_at,
    // Forventningen matcher trialens 60-sekunders loft, ikke den betalte pipeline
    forventetSekunder: Math.round(trial.timeoutMs / 1000),
  });
}
