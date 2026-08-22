import { NextResponse, type NextRequest } from "next/server";
import { erAdmin } from "@/lib/auth/admin";
import { da } from "@/lib/copy/da";
import { nyUdloebsdato } from "@/lib/credits/ledger";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Admin: tildel kreditter manuelt (ejer-ordre 22/8) — til support,
// kompensation ved fejl, testbrugere og kampagner. Går gennem den ALMINDELIGE
// ledger, så saldo, udløb og historik opfører sig præcis som ved et køb.
//
// Idempotensnøglen indeholder en note fra admin, så samme tildeling ikke
// rammer to gange ved dobbeltklik — men en NY note kan tildele igen.
const MAKS_PR_TILDELING = 500;

async function erAdminRequest(): Promise<boolean> {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return erAdmin(user?.email);
}

export async function POST(request: NextRequest) {
  if (!(await erAdminRequest())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  const krop = (await request.json()) as {
    email?: string;
    antal?: number;
    note?: string;
  };
  const email = (krop.email ?? "").trim().toLowerCase();
  const antal = Number(krop.antal);
  const note = (krop.note ?? "").trim();

  if (!email) {
    return NextResponse.json({ fejl: da.admin.tildel.fejlEmail }, { status: 400 });
  }
  if (!Number.isFinite(antal) || antal === 0 || Math.abs(antal) > MAKS_PR_TILDELING) {
    return NextResponse.json(
      { fejl: da.admin.tildel.fejlAntal(MAKS_PR_TILDELING) },
      { status: 400 },
    );
  }
  if (note.length < 3) {
    return NextResponse.json({ fejl: da.admin.tildel.fejlNote }, { status: 400 });
  }

  const service = opretServiceKlient();
  const { data: profil } = await service
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();
  if (!profil) {
    return NextResponse.json({ fejl: da.admin.tildel.fejlUkendt }, { status: 404 });
  }

  const ledger = new SupabaseLedgerDb(service);
  const resultat = await ledger.tilfoejKreditter({
    userId: profil.id as string,
    delta: antal,
    reason: "admin",
    // Noten er en del af nøglen: dobbeltklik rammer samme nøgle (no-op),
    // mens en ny begrundelse tillader en ny tildeling
    idempotencyKey: `admin:${profil.id}:${antal}:${note.slice(0, 60)}`,
    kilde: "pack",
    udloeber: antal > 0 ? nyUdloebsdato() : undefined,
  });
  if ("fejl" in resultat) {
    return NextResponse.json({ fejl: da.admin.tildel.fejlSaldo }, { status: 409 });
  }

  return NextResponse.json({ ok: true, email, antal, saldo: resultat.saldo });
}
