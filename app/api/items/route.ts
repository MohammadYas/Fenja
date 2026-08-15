import { NextResponse, type NextRequest } from "next/server";
import { misbrugsvaern, upload, vinted } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { koerItemPipeline } from "@/lib/pipeline/run";
import { STANDARD_PRESET_ID, PRESETS } from "@/lib/pipeline/presets";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

type NytItemKrop = {
  kladdeId: string;
  maerke: string;
  stoerrelse: string;
  stand: string;
  kategori: string;
  fejlBeskrivelse?: string;
  koebsprisDkk?: number;
  presetId?: string;
  fotos: { rolle: string; sti: string }[];
};

// Opretter item + fotos og starter pipelinen (B-3/B-4). Rate limit og
// saldo-tjek før noget koster penge (E-5).
export async function POST(request: NextRequest) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const krop = (await request.json()) as NytItemKrop;

  // Validering (B-1/B-3)
  const harHelhed = krop.fotos?.some((f) => f.rolle === "full");
  if (!harHelhed) {
    return NextResponse.json({ fejl: da.nytItem.fejlHelhedMangler }, { status: 400 });
  }
  if (!krop.maerke?.trim() || !krop.stoerrelse?.trim() || !krop.kategori?.trim()) {
    return NextResponse.json({ fejl: da.nytItem.fejlFelterMangler }, { status: 400 });
  }
  if (!(vinted.standskala as readonly string[]).includes(krop.stand)) {
    return NextResponse.json({ fejl: da.nytItem.fejlFelterMangler }, { status: 400 });
  }
  const presetId = krop.presetId ?? STANDARD_PRESET_ID;
  if (!PRESETS.some((p) => p.id === presetId)) {
    return NextResponse.json({ fejl: "ukendt preset" }, { status: 400 });
  }
  for (const foto of krop.fotos) {
    if (!(upload.roller as readonly string[]).includes(foto.rolle)) {
      return NextResponse.json({ fejl: "ugyldig fotorolle" }, { status: 400 });
    }
    if (!foto.sti.startsWith(`${user.id}/`)) {
      return NextResponse.json({ fejl: "ugyldig fotosti" }, { status: 400 });
    }
  }

  const service = opretServiceKlient();

  // Rate limit pr. bruger pr. dag (E-5)
  const midnat = new Date();
  midnat.setUTCHours(0, 0, 0, 0);
  const { count } = await service
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", midnat.toISOString());
  if ((count ?? 0) >= misbrugsvaern.maksAnnoncerPrBrugerPrDag) {
    return NextResponse.json({ fejl: da.nytItem.fejlRateLimit }, { status: 429 });
  }

  // Saldo-tjek før start — kreditter trækkes først ved leverance (E-3)
  const ledger = new SupabaseLedgerDb(service);
  const saldo = await ledger.hentSaldo(user.id);
  if (saldo < 1) {
    return NextResponse.json({ fejl: da.nytItem.fejlIngenKreditter }, { status: 402 });
  }

  const { data: item, error: itemFejl } = await service
    .from("items")
    .insert({
      user_id: user.id,
      brand: krop.maerke.trim(),
      size: krop.stoerrelse.trim(),
      condition: krop.stand,
      category: krop.kategori.trim(),
      defects_text: krop.fejlBeskrivelse?.trim() || null,
      purchase_price_dkk: krop.koebsprisDkk ?? null,
      status: "draft",
    })
    .select("id")
    .single();
  if (itemFejl || !item) {
    return NextResponse.json({ fejl: itemFejl?.message ?? "oprettelse fejlede" }, { status: 500 });
  }

  const { error: fotoFejl } = await service.from("item_photos").insert(
    krop.fotos.map((f) => ({
      item_id: item.id,
      role: f.rolle,
      original_url: f.sti,
    })),
  );
  if (fotoFejl) {
    return NextResponse.json({ fejl: fotoFejl.message }, { status: 500 });
  }

  await startPipeline(item.id as string, presetId);

  return NextResponse.json({ itemId: item.id });
}

// Med Trigger.dev-nøgle køres jobbet dér (G-3); uden nøgle (lokal dev/mock)
// køres pipelinen i baggrunden i processen — mock-providers er hurtige.
async function startPipeline(itemId: string, presetId: string): Promise<void> {
  if (process.env.TRIGGER_SECRET_KEY) {
    const { tasks } = await import("@trigger.dev/sdk");
    await tasks.trigger("item-pipeline", { itemId, presetId });
    return;
  }
  const service = opretServiceKlient();
  void koerItemPipeline(
    {
      db: new SupabasePipelineDb(service),
      storage: new SupabasePipelineStorage(service),
      image: await hentImageProvider(),
      text: await hentTextProvider(),
      ledger: new SupabaseLedgerDb(service),
    },
    itemId,
    presetId,
  ).catch((fejl) => {
    console.error(`Pipeline fejlede for item ${itemId}:`, fejl);
  });
}
