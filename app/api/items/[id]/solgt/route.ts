import { NextResponse, type NextRequest } from "next/server";
import { opretServerKlient } from "@/lib/supabase/server";

// Markér som solgt med salgspris (B-7). Kører som brugeren — RLS sikrer ejerskab.
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

  const krop = (await request.json()) as { salgsprisDkk?: number };
  const pris = Number(krop.salgsprisDkk);
  if (!Number.isFinite(pris) || pris < 0) {
    return NextResponse.json({ fejl: "ugyldig pris" }, { status: 400 });
  }

  const { error, count } = await supabase
    .from("items")
    .update(
      { status: "sold", sold_price_dkk: pris, solgt_at: new Date().toISOString() },
      { count: "exact" },
    )
    .eq("id", id);
  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 });
  if (!count) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
