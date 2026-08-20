import { NextResponse, type NextRequest } from "next/server";
import { forventetSekunder } from "@/lib/fremdrift";
import { VISNINGS_TYPER } from "@/lib/pipeline/visninger";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const VISNINGS_IDER = new Set<string>(VISNINGS_TYPER.map((v) => v.id));

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
      "id, status, leveret_at, created_at, visninger, generations(kind, status, output_url, created_at, prompt_version)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  const generinger = item.generations as {
    kind: string;
    status: string;
    output_url: string | null;
    created_at: string;
    prompt_version: string | null;
  }[];
  // Serverens sandhed om hvor mange billeder der ER bestilt (items.visninger) —
  // ellers ville framen-kontoen vokse løbende med generations-rækkerne, og
  // forventet varighed skaleres nu rigtigt fra første poll
  const valgteVisninger = (item as { visninger?: string[] | null }).visninger;
  const totalBilleder = Array.isArray(valgteVisninger)
    ? valgteVisninger.length
    : generinger.filter((g) => g.kind === "onmodel").length;
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
  // visualiseringer — ÆLDSTE FØRST, så listen kun vokser bagpå og klienten
  // kan beholde allerede viste billeder (nye tokens hvert poll fik billedet
  // til at "loade forfra" igen og igen — ejer-klage 20/8)
  const service = opretServiceKlient();
  const billeder = (
    await Promise.all(
      generinger
        .filter((g) => g.kind === "onmodel" && g.status === "succeeded" && g.output_url)
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map(async (g) => {
          const { data } = await service.storage
            .from("item-photos")
            .createSignedUrl(g.output_url!, 600);
          if (!data?.signedUrl) return null;
          // Hvilken visning billedet hører til (ejer-rapport 20/8: "den sætter
          // de forkerte billeder ind" undervejs) — rammen skal vise SIN egen
          // visning, ikke bare det der blev færdigt først. Visnings-tagget
          // står i prompt_version som "<visningId>@vN" (FR-15).
          const visningId =
            (g.prompt_version ?? "")
              .split(" ")
              .map((tag) => tag.split("@")[0]!)
              .find((id) => VISNINGS_IDER.has(id)) ?? null;
          return { visningId, url: data.signedUrl };
        }),
    )
  ).filter((b): b is { visningId: string | null; url: string } => b !== null);

  const antalBilleder = Math.max(1, totalBilleder);

  return NextResponse.json({
    leveret,
    fejlet,
    startetAt: item.created_at,
    forventetSekunder: forventetSekunder(antalBilleder),
    totalBilleder,
    /** Brugerens valgte rækkefølge — rammerne står i den, ikke i færdig-orden */
    visninger: Array.isArray(valgteVisninger) ? valgteVisninger : [],
    billeder,
    trin: generinger.map((g) => ({ kind: g.kind, status: g.status })),
  });
}
