import { NextResponse, type NextRequest } from "next/server";
import { kontakt } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { bedstMuligt } from "@/lib/emails/notifikationer";
import { hentEmailAfsender } from "@/lib/emails/send";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Kontaktformular (ejer-ordre 21/8 nat): offentlig — ingen login krævet.
// Henvendelsen gemmes til admin-panelet, og ejeren får en mail med det samme.
// Honeypot-felt + loft pr. e-mail/dag holder spam ude uden CAPTCHA-friktion.
const MAKS_PR_EMAIL_PR_DAG = 5;

export async function POST(request: NextRequest) {
  const krop = (await request.json()) as {
    navn?: string;
    email?: string;
    besked?: string;
    /** Honeypot — mennesker ser aldrig feltet; bots udfylder det */
    hjemmeside?: string;
  };

  // Honeypot: svar pænt OK uden at gemme noget — botten skal ikke lære noget
  if (krop.hjemmeside) return NextResponse.json({ ok: true });

  const navn = (krop.navn ?? "").trim();
  const email = (krop.email ?? "").trim().toLowerCase();
  const besked = (krop.besked ?? "").trim();
  if (navn.length < 1 || navn.length > 120) {
    return NextResponse.json({ fejl: da.kontaktSide.fejlNavn }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ fejl: da.kontaktSide.fejlEmail }, { status: 400 });
  }
  if (besked.length < 3 || besked.length > 4000) {
    return NextResponse.json({ fejl: da.kontaktSide.fejlBesked }, { status: 400 });
  }

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

  // Besked til ejeren med det samme — best-effort, henvendelsen ER gemt
  await bedstMuligt(async () => {
    await hentEmailAfsender().send({
      til: kontakt.email,
      emne: `Selja-henvendelse fra ${navn}`,
      html: `<!doctype html><html><body><p><strong>${navn}</strong> (${email}) skriver:</p><p style="white-space:pre-wrap">${besked
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</p><p>Svar direkte på ${email}. Henvendelsen ligger også i admin-panelet.</p></body></html>`,
    });
  });

  return NextResponse.json({ ok: true });
}
