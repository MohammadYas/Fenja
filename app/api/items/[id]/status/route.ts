import { NextResponse, type NextRequest } from "next/server";
import { forventetSekunder } from "@/lib/fremdrift";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Progress-data til polling (B-4): reelle pipeline-trin fra generations-
// rækkerne. Bulletproof (ejer-ordrer 20/8): svaret bærer starttiden (kurven
// er forankret i virkeligheden), fejlet/hængende-status, forventet varighed
// (2-3 min pr. billede) OG de færdige billeder løbende — billede 1 vises,
// så snart det er klar, ikke først når hele leverancen lander.
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
    .select(
      "id, status, leveret_at, created_at, generations(kind, status, output_url, created_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  const generinger = item.generations as {
    kind: string;
    status: string;
    output_url: string | null;
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

  // Færdige billeder NU (ejer-ordre): signerede urls for vellykkede
  // visualiseringer, nyeste først
  const service = opretServiceKlient();
  const billeder = (
    await Promise.all(
      generinger
        .filter((g) => g.kind === "onmodel" && g.status === "succeeded" && g.output_url)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(async (g) => {
          const { data } = await service.storage
            .from("item-photos")
            .createSignedUrl(g.output_url!, 600);
          return data?.signedUrl ?? null;
        }),
    )
  ).filter((url): url is string => url !== null);

  const antalBilleder = generinger.filter((g) => g.kind === "onmodel").length;

  return NextResponse.json({
    leveret,
    fejlet,
    startetAt: item.created_at,
    forventetSekunder: forventetSekunder(antalBilleder),
    billeder,
    trin: generinger.map((g) => ({ kind: g.kind, status: g.status })),
  });
}
