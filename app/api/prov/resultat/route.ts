import { NextResponse, type NextRequest } from "next/server";
import { da } from "@/lib/copy/da";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { opretServiceKlient } from "@/lib/supabase/service";
import { TRIAL_BUCKET, hentTrialViaTokenHash } from "@/lib/trial/db";
import { delvisBeskrivelse, delvisSoegeord } from "@/lib/trial/resultat";
import { trialTokenHash } from "@/lib/trial/vaern";

// Det anonyme resultat: VANDMÆRKET billede i reduceret opløsning (signeret
// kortlivet URL), titel + de første 60 % af beskrivelsen (resten forlader
// aldrig serveren — se lib/trial/resultat.ts) og prisforslaget fuldt ud
// (wow-øjeblikket). Det rene billede og den fulde tekst låses op ved signup.
export async function GET(request: NextRequest) {
  const graense = await tjekRateLimit("prov-resultat", klientNoegle(request), 120, 3600);
  if (!graense.tilladt) return forMangeKald(graense.nulstillerOm);

  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ fejl: da.prov.fejlFindesIkke }, { status: 404 });
  }
  const service = opretServiceKlient();
  const raekke = await hentTrialViaTokenHash(service, trialTokenHash(token));
  if (!raekke || raekke.status !== "completed" || !raekke.resultat) {
    return NextResponse.json({ fejl: da.prov.fejlFindesIkke }, { status: 404 });
  }

  let billedeUrl: string | null = null;
  if (raekke.vandmaerket_sti) {
    const { data } = await service.storage
      .from(TRIAL_BUCKET)
      .createSignedUrl(raekke.vandmaerket_sti, 600);
    billedeUrl = data?.signedUrl ?? null;
  }

  const tekst = raekke.resultat;
  const beskrivelse = delvisBeskrivelse(tekst.beskrivelse);
  const soegeord = delvisSoegeord(tekst.soegeord);

  return NextResponse.json({
    billedeUrl,
    kategori: raekke.kategori,
    titel: tekst.titel,
    beskrivelseSynlig: beskrivelse.synlig,
    beskrivelseSkjulteTegn: beskrivelse.skjulteTegn,
    soegeordSynlige: soegeord.synlige,
    soegeordSkjulte: soegeord.skjulte,
    // Prisforslaget vises fuldt ud — det er billigt og er wow-øjeblikket
    prisforslagDkk: tekst.prisforslagDkk,
    prisBegrundelse: tekst.prisBegrundelse,
  });
}
