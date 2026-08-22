import { NextResponse, type NextRequest } from "next/server";
import { foreslaaForhandlingssvar } from "@/lib/ai/tekst-hjaelper";
import { harAktivtAbonnement } from "@/lib/betaling/abonnement";
import { da } from "@/lib/copy/da";
import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Forhandlings-hjælper (abonnent-fordel, 21/8 nat): køberen har budt — få tre
// klar-til-at-sende svar forankret i annoncens prisleje og markedets median.
// Koster ALDRIG kreditter; loftet holder udgiften mikroskopisk (~0,03 kr./kald).
const MAKS_PR_DAG = 25;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  if (!user.email || !(await harAktivtAbonnement(user.email))) {
    return NextResponse.json({ fejl: da.forhandling.kunAbonnenter }, { status: 403 });
  }

  const krop = (await request.json()) as { budDkk?: number };
  const bud = Number(krop.budDkk);
  if (!Number.isFinite(bud) || bud < 1 || bud > 100_000) {
    return NextResponse.json({ fejl: da.forhandling.fejlBud }, { status: 400 });
  }

  const service = opretServiceKlient();
  const { data: item } = await service
    .from("items")
    .select("id, user_id, titel, brand, category, pris_fra_dkk, pris_til_dkk")
    .eq("id", id)
    .maybeSingle();
  if (!item || item.user_id !== user.id) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  // Dagligt loft pr. bruger — misbrugsværn uden at genere normal brug
  const midnat = new Date();
  midnat.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("besoeg")
    .select("id", { count: "exact", head: true })
    .eq("sti", `/intern/forhandling/${user.id}`)
    .gte("created_at", midnat.toISOString());
  if ((count ?? 0) >= MAKS_PR_DAG) {
    return NextResponse.json({ fejl: da.forhandling.fejlLoft }, { status: 429 });
  }
  await service
    .from("besoeg")
    .insert({ sti: `/intern/forhandling/${user.id}`, enhed: "ukendt" });

  const interval = findMarkedsinterval(
    (item.brand as string | null) ?? "",
    (item.category as string | null) ?? "",
  );

  try {
    const svar = await foreslaaForhandlingssvar({
      titel:
        (item.titel as string | null) ??
        `${(item.brand as string | null) ?? ""} ${(item.category as string | null) ?? ""}`.trim(),
      prisFraDkk: item.pris_fra_dkk as number | null,
      prisTilDkk: item.pris_til_dkk as number | null,
      budDkk: Math.round(bud),
      medianDkk: interval?.medianDkk ?? null,
    });
    return NextResponse.json(svar);
  } catch {
    return NextResponse.json({ fejl: da.fejl.generel }, { status: 502 });
  }
}
