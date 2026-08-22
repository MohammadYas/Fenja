import { NextResponse, type NextRequest } from "next/server";
import { skrivBundleTekst } from "@/lib/ai/tekst-hjaelper";
import { hentAbonnementsTier } from "@/lib/betaling/abonnement";
import { bundle } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Bundle-bygger (KUN Pro, 21/8 nat): vælg 2-4 aktive annoncer og få én
// samlet pakke-annonce med skarp pakkepris. Koster aldrig kreditter.
const MAKS_PR_DAG = 15;

export async function POST(request: NextRequest) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  if (!user.email || (await hentAbonnementsTier(user.email)) !== "pro") {
    return NextResponse.json({ fejl: da.bundleBygger.kunPro }, { status: 403 });
  }

  const krop = (await request.json()) as { itemIds?: string[] };
  const ids = [...new Set(krop.itemIds ?? [])].filter(
    (id) => typeof id === "string" && /^[0-9a-f-]{36}$/.test(id),
  );
  if (ids.length < 2 || ids.length > bundle.maksItems) {
    return NextResponse.json({ fejl: da.bundleBygger.fejlAntal }, { status: 400 });
  }

  const service = opretServiceKlient();

  // Dagligt loft (samme mønster som forhandlings-hjælperen)
  const midnat = new Date();
  midnat.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("besoeg")
    .select("id", { count: "exact", head: true })
    .eq("sti", `/intern/bundle/${user.id}`)
    .gte("created_at", midnat.toISOString());
  if ((count ?? 0) >= MAKS_PR_DAG) {
    return NextResponse.json({ fejl: da.bundleBygger.fejlLoft }, { status: 429 });
  }
  await service.from("besoeg").insert({ sti: `/intern/bundle/${user.id}`, enhed: "ukendt" });

  const { data } = await service
    .from("items")
    .select("id, user_id, titel, brand, category, status, pris_til_dkk")
    .in("id", ids);
  const items = (data ?? []).filter(
    (i) => i.user_id === user.id && i.status === "active",
  );
  if (items.length !== ids.length) {
    return NextResponse.json({ fejl: da.bundleBygger.fejlItems }, { status: 400 });
  }

  const samletFoer = items.reduce((sum, i) => sum + Number(i.pris_til_dkk ?? 0), 0);
  if (samletFoer <= 0) {
    return NextResponse.json({ fejl: da.bundleBygger.fejlPris }, { status: 400 });
  }
  // Pakkepris: rabat fra config, rundet PÆNT ned til nærmeste 5 kr.
  const bundlePris = Math.max(5, Math.floor((samletFoer * (1 - bundle.rabatPct / 100)) / 5) * 5);

  try {
    const tekst = await skrivBundleTekst({
      items: items.map((i) => ({
        titel:
          (i.titel as string | null) ??
          `${(i.brand as string | null) ?? ""} ${(i.category as string | null) ?? ""}`.trim(),
        kategori: (i.category as string | null) ?? "",
        prisTilDkk: i.pris_til_dkk as number | null,
      })),
      samletFoerDkk: samletFoer,
      bundlePrisDkk: bundlePris,
    });
    return NextResponse.json({ ...tekst, samletFoerDkk: samletFoer, bundlePrisDkk: bundlePris });
  } catch {
    return NextResponse.json({ fejl: da.fejl.generel }, { status: 502 });
  }
}
