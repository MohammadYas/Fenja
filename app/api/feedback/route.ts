import { NextResponse, type NextRequest } from "next/server";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const KATEGORIER = ["ros", "fejl", "forslag", "andet"] as const;
const MAKS_PR_DAG = 10;

// Feedback (ejer-ordre 21/8): kort besked fra en logget ind bruger. Loft pr.
// dag så formularen ikke kan bruges som spam-kanal; databasen håndhæver
// længde og kategori en gang til (migration 20260821120000).
export async function POST(request: NextRequest) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const krop = (await request.json()) as { kategori?: string; besked?: string };
  const kategori = krop.kategori ?? "";
  const besked = (krop.besked ?? "").trim();
  if (!(KATEGORIER as readonly string[]).includes(kategori)) {
    return NextResponse.json({ fejl: da.feedback.fejlKategori }, { status: 400 });
  }
  if (besked.length < 3 || besked.length > 2000) {
    return NextResponse.json({ fejl: da.feedback.fejlBesked }, { status: 400 });
  }

  const service = opretServiceKlient();
  const midnat = new Date();
  midnat.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", midnat.toISOString());
  if ((count ?? 0) >= MAKS_PR_DAG) {
    return NextResponse.json({ fejl: da.feedback.fejlLoft }, { status: 429 });
  }

  const { error } = await service
    .from("feedback")
    .insert({ user_id: user.id, kategori, besked });
  if (error) {
    return NextResponse.json({ fejl: da.fejl.generel }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
