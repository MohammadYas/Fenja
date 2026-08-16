import { NextResponse, type NextRequest } from "next/server";
import { lavDelebillede } from "@/lib/pipeline/share";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "item-photos";

async function hentBuffer(stiEllerUrl: string): Promise<Buffer> {
  if (stiEllerUrl.startsWith("http")) {
    const svar = await fetch(stiEllerUrl);
    if (!svar.ok) throw new Error("hentning fejlede");
    return Buffer.from(await svar.arrayBuffer());
  }
  const service = opretServiceKlient();
  const { data, error } = await service.storage.from(BUCKET).download(stiEllerUrl);
  if (error || !data) throw new Error("download fejlede");
  return Buffer.from(await data.arrayBuffer());
}

// Before/after-delebillede (F-4) — genereres på forespørgsel, brugerens eget valg.
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

  // RLS: brugeren kan kun læse egne items
  const { data: item } = await supabase
    .from("items")
    .select("id, item_photos(role, original_url, cleaned_url)")
    .eq("id", id)
    .maybeSingle();
  if (!item) return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });

  const fotos = item.item_photos as {
    role: string;
    original_url: string;
    cleaned_url: string | null;
  }[];
  const helhed = fotos.find((f) => f.role === "full" && f.cleaned_url);
  if (!helhed) {
    return NextResponse.json({ fejl: "intet renset helhedsfoto endnu" }, { status: 409 });
  }

  const [foer, efter] = await Promise.all([
    hentBuffer(helhed.original_url),
    hentBuffer(helhed.cleaned_url!),
  ]);
  const billede = await lavDelebillede(foer, efter);

  return new NextResponse(new Uint8Array(billede), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="selja-foer-efter.jpg"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
