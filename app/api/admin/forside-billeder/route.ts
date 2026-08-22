import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { erAdmin } from "@/lib/auth/admin";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

// Admin: billeder til forsiden (ejer-ordre 21/8 nat: "fra admin panelet skal
// jeg kunne tilføje flere billeder til Seljas forside"). Uploades til den
// offentlige forside-billeder-bucket som webp; forsiden samler dem op ved
// næste revalidering (ingen deploy nødvendig). Alle andre får 404.
const BUCKET = "forside-billeder";
const MAKS_BYTES = 8_000_000;

async function erAdminRequest(): Promise<boolean> {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return erAdmin(user?.email);
}

export async function POST(request: NextRequest) {
  if (!(await erAdminRequest())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }

  const form = await request.formData();
  const fil = form.get("fil");
  if (!(fil instanceof File)) {
    return NextResponse.json({ fejl: da.admin.forsideBilleder.fejlIngenFil }, { status: 400 });
  }
  if (fil.size > MAKS_BYTES) {
    return NextResponse.json({ fejl: da.admin.forsideBilleder.fejlForStor }, { status: 400 });
  }

  // Konverter til webp i forside-størrelse — samme format som resten af serien
  let webp: Buffer;
  try {
    webp = await sharp(Buffer.from(await fil.arrayBuffer()))
      .rotate() // respektér EXIF-rotation fra telefoner
      .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ fejl: da.admin.forsideBilleder.fejlUgyldig }, { status: 400 });
  }

  const navn = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const service = opretServiceKlient();
  const { error } = await service.storage
    .from(BUCKET)
    .upload(navn, webp, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, navn });
}

export async function GET() {
  if (!(await erAdminRequest())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }
  const service = opretServiceKlient();
  const { data, error } = await service.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 });
  const { data: pub } = service.storage.from(BUCKET).getPublicUrl("x");
  const base = pub.publicUrl.replace(/\/x$/, "");
  return NextResponse.json({
    billeder: (data ?? [])
      .filter((f) => f.name.endsWith(".webp"))
      .map((f) => ({ navn: f.name, url: `${base}/${f.name}` })),
  });
}

export async function DELETE(request: NextRequest) {
  if (!(await erAdminRequest())) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }
  const { navn } = (await request.json()) as { navn?: string };
  if (!navn || navn.includes("/") || navn.includes("..")) {
    return NextResponse.json({ fejl: "ugyldigt navn" }, { status: 400 });
  }
  const service = opretServiceKlient();
  const { error } = await service.storage.from(BUCKET).remove([navn]);
  if (error) return NextResponse.json({ fejl: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
