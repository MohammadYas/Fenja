import { NextResponse, type NextRequest } from "next/server";
import { upload } from "@/lib/config";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "item-photos";

// Signeret upload-URL (NFR-6): klienten uploader direkte til privat bucket
// uden at service-nøglen forlader serveren. Stien er låst til brugerens mappe.
export async function POST(request: NextRequest) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const krop = (await request.json()) as { kladdeId?: string; rolle?: string };
  const rolle = krop.rolle ?? "";
  const kladdeId = krop.kladdeId ?? "";

  if (!(upload.roller as readonly string[]).includes(rolle)) {
    return NextResponse.json({ fejl: "ugyldig rolle" }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/.test(kladdeId)) {
    return NextResponse.json({ fejl: "ugyldigt kladde-id" }, { status: 400 });
  }

  const sti = `${user.id}/${kladdeId}/original-${rolle}.jpg`;
  const service = opretServiceKlient();
  const { data, error } = await service.storage
    .from(BUCKET)
    .createSignedUploadUrl(sti, { upsert: true });
  if (error || !data) {
    return NextResponse.json({ fejl: error?.message ?? "signering fejlede" }, { status: 500 });
  }

  return NextResponse.json({ sti, token: data.token });
}
