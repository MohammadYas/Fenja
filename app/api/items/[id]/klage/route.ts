import { NextResponse, type NextRequest } from "next/server";
import { opretServerKlient } from "@/lib/supabase/server";

// Klage over et genereret billede (ejer-ordre 2026-08-20): brugeren anmoder
// om sin kredit tilbage; klagen lander i admin-panelet. Kører som brugeren —
// RLS sikrer ejerskab af item, og unique(item_id) sikrer én klage pr. item.
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

  const krop = (await request.json()) as { begrundelse?: string };
  const begrundelse = (krop.begrundelse ?? "").trim();
  if (begrundelse.length < 10 || begrundelse.length > 1000) {
    return NextResponse.json(
      { fejl: "begrundelsen skal være mellem 10 og 1000 tegn" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("klager").insert({
    user_id: user.id,
    item_id: id,
    begrundelse,
  });
  if (error) {
    // 23505 = unique violation → der findes allerede en klage på dette item
    if (error.code === "23505") {
      return NextResponse.json({ fejl: "allerede klaget" }, { status: 409 });
    }
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
