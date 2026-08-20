import { NextResponse, type NextRequest } from "next/server";
import { sletItemsFiler } from "@/lib/item/slet";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "item-photos";

// Slet annonce fra oversigten (ejer-ordre 20/8). Ejerskab håndhæves både af
// RLS-checket her og af delete-filtrene — en bruger kan aldrig slette en
// andens annonce. Ledgeren røres IKKE: brugte kreditter forbliver brugt.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const service = opretServiceKlient();

  // Ejerskab før noget som helst røres
  const { data: item } = await service
    .from("items")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  // 1) Storage først — intet må blive forældreløst ved et nedbrud midt i
  try {
    await sletItemsFiler(service.storage.from(BUCKET), user.id, id);
  } catch (fejl) {
    return NextResponse.json({ fejl: String(fejl) }, { status: 500 });
  }

  // 2) Afhængige rækker: genereringer, fotos og klager
  await service.from("generations").delete().eq("item_id", id);
  await service.from("item_photos").delete().eq("item_id", id);
  await service.from("klager").delete().eq("item_id", id);

  // 3) Selve annoncen — med ejerskabs-filter som sidste bagstopper
  const { error } = await service
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  return NextResponse.json({ slettet: true });
}
