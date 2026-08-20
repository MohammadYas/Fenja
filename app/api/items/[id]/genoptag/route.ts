import { NextResponse, type NextRequest } from "next/server";
import { da } from "@/lib/copy/da";
import { STANDARD_PRESET_ID } from "@/lib/pipeline/presets";
import { startPipeline } from "@/lib/pipeline/start";
import { STANDARD_VISNING_ID } from "@/lib/pipeline/visninger";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Genoptag en hængende eller fejlet pipeline (bulletproof, ejer-ordre 20/8):
// en server-genstart eller et providerudfald må aldrig efterlade annoncen i
// evigt "på vej". Genkørsel er sikker: ledger og leverance er idempotente
// pr. item (E-4), så det kan aldrig koste dobbelt.
const KOERER_STADIG_MS = 2 * 60 * 1000;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  // RLS: brugeren kan kun se sit eget item
  const { data: item } = await supabase
    .from("items")
    .select("id, leveret_at, generations(status, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  if (item.leveret_at) return NextResponse.json({ leveret: true });

  // Kører en generering lige nu, genstarter vi ikke oveni
  const generinger = item.generations as { status: string; created_at: string }[];
  const koererStadig = generinger.some(
    (g) =>
      g.status === "running" &&
      Date.now() - new Date(g.created_at).getTime() < KOERER_STADIG_MS,
  );
  if (koererStadig) {
    return NextResponse.json({ fejl: da.resultat.genoptagKoerer }, { status: 409 });
  }

  const service = opretServiceKlient();
  // Gemte visninger (migration 20260820100000); mangler kolonnen, køres spejlet
  const { data: medVisninger } = await service
    .from("items")
    .select("visninger")
    .eq("id", id)
    .maybeSingle();
  const visninger = Array.isArray(medVisninger?.visninger)
    ? (medVisninger.visninger as string[])
    : [STANDARD_VISNING_ID];

  await service.from("items").update({ status: "draft" }).eq("id", id);
  await startPipeline(id, STANDARD_PRESET_ID, visninger);

  return NextResponse.json({ genstartet: true });
}
