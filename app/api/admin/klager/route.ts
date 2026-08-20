import { NextResponse, type NextRequest } from "next/server";
import { refunderKlage } from "@/lib/credits/ledger";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Admin-afgørelse af klager (ejer-ordre 2026-08-20). Gated på ADMIN_EMAIL
// som resten af admin (G-1) — alle andre får 404, så ruten ikke røber noget.
// Godkendelse refunderer annonce-prisen via ledgeren, idempotent pr. klage,
// så dobbeltklik/genkørsler aldrig refunderer dobbelt.
async function erAdmin(): Promise<boolean> {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  return Boolean(adminEmail && user?.email === adminEmail);
}

export async function POST(request: NextRequest) {
  if (!(await erAdmin())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  const krop = (await request.json()) as {
    klageId?: string;
    afgoerelse?: string;
  };
  const { klageId } = krop;
  const afgoerelse = krop.afgoerelse;
  if (!klageId || (afgoerelse !== "godkendt" && afgoerelse !== "afvist")) {
    return NextResponse.json({ fejl: "ugyldig afgørelse" }, { status: 400 });
  }

  const service = opretServiceKlient();
  const { data: klage, error } = await service
    .from("klager")
    .select("id, user_id, status")
    .eq("id", klageId)
    .single();
  if (error || !klage) {
    return NextResponse.json({ fejl: "klagen findes ikke" }, { status: 404 });
  }
  if (klage.status !== "aaben") {
    // Allerede behandlet — idempotent no-op, så dobbeltklik er ufarlige
    return NextResponse.json({ ok: true, status: klage.status });
  }

  // Refunder FØR status skrives: fejler refusionen, forbliver klagen åben,
  // og ledgerens idempotensnøgle gør et nyt forsøg sikkert.
  if (afgoerelse === "godkendt") {
    await refunderKlage(new SupabaseLedgerDb(service), klage.user_id, klage.id);
  }

  const { error: opdaterFejl } = await service
    .from("klager")
    .update({ status: afgoerelse, behandlet_at: new Date().toISOString() })
    .eq("id", klageId)
    .eq("status", "aaben");
  if (opdaterFejl) {
    return NextResponse.json({ fejl: opdaterFejl.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: afgoerelse });
}
