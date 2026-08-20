import { NextResponse, type NextRequest } from "next/server";
import { misbrugsvaern, upload, vinted } from "@/lib/config";
import { da } from "@/lib/copy/da";
import {
  UtilstraekkeligSaldoFejl,
  reserverVisninger,
} from "@/lib/credits/ledger";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { STANDARD_PRESET_ID, PRESETS } from "@/lib/pipeline/presets";
import { startPipeline } from "@/lib/pipeline/start";
import { normaliserVisningsvalg } from "@/lib/pipeline/visninger";
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
  // Ejer-ordre 20/8: label og farve skrives — AI læser ikke label-fotos
  labelTekst?: string;
  farve?: string;
  presetId?: string;
  /** Ejer-ordre 20/8: brugeren vælger selv hvilke billeder der genereres */
  visninger?: string[];
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

  // Idempotens (bulletproof, ejer-ordre 20/8): samme kladde må aldrig blive
  // to annoncer — et gentaget kald (netudfald, dobbeltklik, retry) returnerer
  // den eksisterende annonce. Fejler harmløst før migrationen er kørt.
  const { data: eksisterende } = await service
    .from("items")
    .select("id")
    .eq("user_id", user.id)
    .eq("kladde_id", krop.kladdeId)
    .maybeSingle();
  if (eksisterende) {
    return NextResponse.json({ itemId: eksisterende.id });
  }

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

  // Visningsvalg (ejer-ordre 20/8): 1 kredit pr. billede; mindst ét kræves
  const visninger = normaliserVisningsvalg(krop.visninger ?? ["spejl"]);
  if (visninger.length === 0) {
    return NextResponse.json({ fejl: da.nytItem.fejlVisningMangler }, { status: 400 });
  }

  // Saldo-tjek før noget oprettes (ejer-ordre 20/8: kreditterne RESERVERES
  // ved start — selve trækket sker lige efter item-oprettelsen)
  const ledger = new SupabaseLedgerDb(service);
  const saldo = await ledger.hentSaldo(user.id);
  if (saldo < visninger.length) {
    return NextResponse.json(
      {
        fejl:
          visninger.length > 1
            ? da.nytItem.fejlForFaaKreditter(visninger.length)
            : da.nytItem.fejlIngenKreditter,
      },
      { status: 402 },
    );
  }

  const basisItem = {
    user_id: user.id,
    brand: krop.maerke.trim(),
    size: krop.stoerrelse.trim(),
    condition: krop.stand,
    category: krop.kategori.trim(),
    defects_text: krop.fejlBeskrivelse?.trim() || null,
    purchase_price_dkk: krop.koebsprisDkk ?? null,
    status: "draft",
  };
  let { data: item, error: itemFejl } = await service
    .from("items")
    .insert({
      ...basisItem,
      label_text: krop.labelTekst?.trim() || null,
      color: krop.farve?.trim() || null,
      kladde_id: krop.kladdeId,
      visninger: visninger.map((v) => v.id),
    })
    .select("id")
    .single();
  if (itemFejl && /duplicate|unique|unik/i.test(itemFejl.message)) {
    // To samtidige forsøg på samme kladde: unik-indekset vandt — returnér
    // den annonce, der allerede blev oprettet
    const { data: dublet } = await service
      .from("items")
      .select("id")
      .eq("user_id", user.id)
      .eq("kladde_id", krop.kladdeId)
      .maybeSingle();
    if (dublet) return NextResponse.json({ itemId: dublet.id });
  }
  if (itemFejl && /label_text|color|kladde_id|visninger|column/i.test(itemFejl.message)) {
    // Migrationer (20260820020000/20260820100000) er ikke kørt endnu — opret
    // uden de nye felter, så leverancen aldrig blokeres af manglende kolonner
    ({ data: item, error: itemFejl } = await service
      .from("items")
      .insert(basisItem)
      .select("id")
      .single());
  }
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

  // RESERVATION (ejer-ordre 20/8): 1 kredit pr. valgt billede trækkes NU —
  // idempotent pr. (item, visning), så retries aldrig trækker dobbelt. Man
  // kan ikke spamme genereringer og afbryde uden at have betalt; fejlede
  // billeder refunderes automatisk af pipelinen.
  try {
    await reserverVisninger(
      ledger,
      user.id,
      item.id as string,
      visninger.map((v) => v.id),
    );
  } catch (fejl) {
    if (fejl instanceof UtilstraekkeligSaldoFejl) {
      // Saldoen ændrede sig undervejs — ryd op og afvis ærligt
      await service.from("item_photos").delete().eq("item_id", item.id);
      await service.from("items").delete().eq("id", item.id);
      return NextResponse.json(
        { fejl: da.nytItem.fejlIngenKreditter },
        { status: 402 },
      );
    }
    throw fejl;
  }

  await startPipeline(item.id as string, presetId, visninger.map((v) => v.id));

  return NextResponse.json({ itemId: item.id });
}

