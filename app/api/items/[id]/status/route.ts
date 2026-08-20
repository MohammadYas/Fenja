import { NextResponse, type NextRequest } from "next/server";
import { opretServerKlient } from "@/lib/supabase/server";

// Progress-data til polling (B-4): reelle pipeline-trin fra generations-
// rækkerne. Bulletproof (ejer-ordre 20/8): svaret bærer også starttiden (så
// fremdriftskurven er forankret i virkeligheden, ikke i sidste refresh) og
// om kørslen er fejlet/hængende, så UI'et kan tilbyde genstart.
// 10 min: rigtige provider-kørsler (flere billeder × retries) kan tage flere
// minutter uden nye generations-rækker — 3 min gav falske "gik i stå"
// (ejer-rapport 20/8: boksen kom efter baren næsten var i mål).
const HAENGER_EFTER_MS = 10 * 60 * 1000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  // RLS sikrer at brugeren kun ser egne items
  const { data: item } = await supabase
    .from("items")
    .select("id, status, leveret_at, created_at, generations(kind, status, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  const generinger = item.generations as {
    kind: string;
    status: string;
    created_at: string;
  }[];
  const leveret = item.leveret_at != null;
  const koerer = generinger.some(
    (g) =>
      g.status === "running" &&
      Date.now() - new Date(g.created_at).getTime() < HAENGER_EFTER_MS,
  );
  const senesteAktivitet = generinger.reduce(
    (nyeste, g) => Math.max(nyeste, new Date(g.created_at).getTime()),
    new Date(item.created_at as string).getTime(),
  );
  // Fejlet eksplicit, eller intet er sket i lang tid uden leverance —
  // fx fordi serveren genstartede midt i en kørsel i processen
  const fejlet =
    !leveret &&
    !koerer &&
    (item.status === "failed" ||
      Date.now() - senesteAktivitet > HAENGER_EFTER_MS);

  return NextResponse.json({
    leveret,
    fejlet,
    startetAt: item.created_at,
    trin: generinger.map((g) => ({ kind: g.kind, status: g.status })),
  });
}
