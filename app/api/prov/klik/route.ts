import { NextResponse, type NextRequest } from "next/server";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { opretServiceKlient } from "@/lib/supabase/service";
import { hentTrialViaTokenHash, logTrialEvent } from "@/lib/trial/db";
import { trialTokenHash } from "@/lib/trial/vaern";

// Tragtens manglende trin (dataanalyse 27/8): 2 besøgende fik et færdigt
// resultat, og NUL oprettede en konto — men der fandtes intet mellem
// "resultatet blev vist" og "kontoen blev oprettet". Uden det trin kan
// "de ville ikke" ikke skelnes fra "de ville, men faldt fra undervejs",
// og de to har hver sin rettelse.
//
// Ruten er en ren måler: den skriver ét event og svarer ALTID 204. Den må
// aldrig forsinke eller forstyrre klikket, den måler — derfor ingen fejl
// tilbage til klienten, uanset hvad der går galt.
export async function POST(request: NextRequest) {
  // Samme brandmur som de øvrige åbne ruter, så måleren ikke kan pumpes fuld
  const graense = await tjekRateLimit("prov-klik", klientNoegle(request), 60, 3600);
  if (!graense.tilladt) return forMangeKald(graense.nulstillerOm);

  try {
    const krop = (await request.json()) as Record<string, unknown>;
    const token = typeof krop.token === "string" ? krop.token : "";
    if (!/^[0-9a-f-]{36}$/i.test(token)) return new NextResponse(null, { status: 204 });

    const service = opretServiceKlient();
    // Tokenet oversættes til rækkens id, så eventet kan kobles til den
    // konkrete prøve — et gættet token rammer ingen række og logger intet.
    const raekke = await hentTrialViaTokenHash(service, trialTokenHash(token));
    if (!raekke) return new NextResponse(null, { status: 204 });

    await logTrialEvent(service, "trial_cta_klik", { trialId: raekke.id });
  } catch {
    // stille — måling må aldrig vælte noget
  }
  return new NextResponse(null, { status: 204 });
}
