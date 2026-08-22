import { NextResponse, type NextRequest } from "next/server";
import { kontakt } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { bedstMuligt } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { laesOgValider } from "@/lib/sikkerhed/validering";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Kontaktformular (ejer-ordre 21/8 nat): offentlig — ingen login krævet.
// Henvendelsen gemmes til admin-panelet, og ejeren får en mail med det samme.
//
// Sikkerhed (OWASP, 22/8): ruten er offentlig, så den har (1) IP-baseret
// rate limit, (2) skema-validering der kasserer ukendte felter, (3) honeypot
// mod simple bots og (4) et dagligt loft pr. e-mailadresse.
const MAKS_PR_EMAIL_PR_DAG = 5;
const RATE_MAKS = 10;
const RATE_VINDUE_SEK = 3600;

const SKEMA = {
  navn: { slags: "tekst", min: 1, maks: 120 },
  email: { slags: "email" },
  besked: { slags: "tekst", min: 3, maks: 4000 },
  /** Honeypot — mennesker ser aldrig feltet; bots udfylder det */
  hjemmeside: { slags: "tekst", maks: 200, valgfri: true },
} as const;

export async function POST(request: NextRequest) {
  // 1) Rate limit FØR alt andet — også før vi læser kroppen
  const noegle = klientNoegle(request);
  const grænse = await tjekRateLimit("kontakt", noegle, RATE_MAKS, RATE_VINDUE_SEK);
  if (!grænse.tilladt) return forMangeKald(grænse.nulstillerOm);

  // 2) Streng validering; ukendte felter kasseres
  const resultat = await laesOgValider<{
    navn: string;
    email: string;
    besked: string;
    hjemmeside?: string;
  }>(request, SKEMA);
  if (!resultat.ok) {
    const fejl =
      resultat.fejl.felt === "navn"
        ? da.kontaktSide.fejlNavn
        : resultat.fejl.felt === "email"
          ? da.kontaktSide.fejlEmail
          : da.kontaktSide.fejlBesked;
    return NextResponse.json({ fejl }, { status: 400 });
  }
  const { navn, email, besked, hjemmeside } = resultat.data;

  // 3) Honeypot: svar pænt OK uden at gemme noget — botten skal intet lære
  if (hjemmeside) return NextResponse.json({ ok: true });

  const service = opretServiceKlient();
  const midnat = new Date();
  midnat.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("henvendelser")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", midnat.toISOString());
  if ((count ?? 0) >= MAKS_PR_EMAIL_PR_DAG) {
    return NextResponse.json({ fejl: da.kontaktSide.fejlLoft }, { status: 429 });
  }

  // Er afsenderen logget ind, knyttes henvendelsen til kontoen
  let userId: string | null = null;
  try {
    const supabase = await opretServerKlient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const { error } = await service
    .from("henvendelser")
    .insert({ user_id: userId, navn, email, besked });
  if (error) {
    return NextResponse.json({ fejl: da.fejl.generel }, { status: 500 });
  }

  // Besked til ejeren med det samme — best-effort, henvendelsen ER gemt.
  // Bemærk HTML-escapingen: brugerinput må aldrig lande som rå HTML i mailen.
  const escape = (t: string) =>
    t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  await bedstMuligt(async () => {
    await hentEmailAfsender().send({
      til: kontakt.email,
      emne: `Selja-henvendelse fra ${navn}`,
      html: `<!doctype html><html><body><p><strong>${escape(navn)}</strong> (${escape(
        email,
      )}) skriver:</p><p style="white-space:pre-wrap">${escape(
        besked,
      )}</p><p>Svar direkte på ${escape(email)}. Henvendelsen ligger også i admin-panelet.</p></body></html>`,
    });
  });

  return NextResponse.json({ ok: true });
}
