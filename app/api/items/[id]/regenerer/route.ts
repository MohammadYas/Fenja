import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import {
  BudgetloftFejl,
  RegenGraenseFejl,
  RegenVisualiseringFejl,
  koerRegenerering,
  type RegenDel,
} from "@/lib/pipeline/run";
import { PRESETS } from "@/lib/pipeline/presets";
import { kanKoereInline, startRegen } from "@/lib/pipeline/start";
import {
  SupabasePipelineDb,
  SupabasePipelineStorage,
} from "@/lib/pipeline/supabase-db";
import { hentImageProvider, hentTextProvider } from "@/lib/providers";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

type RegenKrop = {
  del: RegenDel;
  presetId?: string;
};

// B-8: regenerér én del af en leveret annonce til reduceret pris.
// Kreditten trækkes først når delen lykkes; requestId gør trækket idempotent.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const { id: itemId } = await params;
  const krop = (await request.json()) as RegenKrop;

  if (krop.del !== "visualisering" && krop.del !== "tekst") {
    return NextResponse.json({ fejl: "ukendt del" }, { status: 400 });
  }
  if (krop.presetId && !PRESETS.some((p) => p.id === krop.presetId)) {
    return NextResponse.json({ fejl: "ukendt preset" }, { status: 400 });
  }

  const service = opretServiceKlient();

  // Ejerskab + kun leverede annoncer kan regenereres
  const { data: item } = await service
    .from("items")
    .select("id, user_id, status")
    .eq("id", itemId)
    .single();
  if (!item || item.user_id !== user.id) {
    return NextResponse.json({ fejl: "findes ikke" }, { status: 404 });
  }
  if (item.status !== "delivered") {
    return NextResponse.json({ fejl: "annoncen er ikke leveret endnu" }, { status: 409 });
  }

  // Saldo-tjek før noget koster penge (E-5); selve trækket sker ved succes
  const ledger = new SupabaseLedgerDb(service);
  const saldo = await ledger.hentSaldo(user.id);
  if (saldo < kreditter.prisRegenerering) {
    return NextResponse.json({ fejl: da.regenerer.fejlSaldo }, { status: 402 });
  }

  const requestId = randomUUID();

  // Kørslen skal ske et sted, der overlever svaret: Netlify-baggrunden først,
  // Trigger.dev som reserve (lib/pipeline/start.ts). Kan ingen af dem tage
  // den, svares ærligt fejl — aldrig et 202 på en kørsel der ikke findes.
  // Kun lokalt/mock køres inline, hvor svaret kan bære resultatet.
  if (!kanKoereInline()) {
    const motor = await startRegen(itemId, krop.del, requestId, krop.presetId);
    if (!motor) {
      return NextResponse.json({ fejl: da.regenerer.fejlAlmen }, { status: 503 });
    }
    return NextResponse.json({ startet: true, requestId, motor }, { status: 202 });
  }

  try {
    const resultat = await koerRegenerering(
      {
        db: new SupabasePipelineDb(service),
        storage: new SupabasePipelineStorage(service),
        image: await hentImageProvider(),
        text: await hentTextProvider(),
        ledger,
      },
      itemId,
      krop.del,
      { requestId, presetId: krop.presetId },
    );
    return NextResponse.json({ faerdig: true, saldoEfter: resultat.saldoEfter });
  } catch (fejl) {
    if (fejl instanceof RegenGraenseFejl) {
      return NextResponse.json({ fejl: da.regenerer.fejlGraense }, { status: 429 });
    }
    if (fejl instanceof RegenVisualiseringFejl) {
      return NextResponse.json({ fejl: da.regenerer.fejlVisualisering }, { status: 502 });
    }
    if (fejl instanceof BudgetloftFejl) {
      return NextResponse.json({ fejl: fejl.message }, { status: 503 });
    }
    return NextResponse.json({ fejl: da.regenerer.fejlAlmen }, { status: 500 });
  }
}
