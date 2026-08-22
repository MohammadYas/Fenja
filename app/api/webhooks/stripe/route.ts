import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { haandterStripeEvent, type StripeCheckoutEvent } from "@/lib/betaling/webhook";
import { kreditter, site } from "@/lib/config";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
import { hentEmailAfsender } from "@/lib/emails/send";
import { bedstMuligt, sendKvittering } from "@/lib/emails/notifikationer";
import { opretServiceKlient } from "@/lib/supabase/service";

// Stripe-webhook (E-2): signatur verificeres altid; kreditering er idempotent
// pr. event-id, så Stripes gentagne leveringsforsøg aldrig krediterer dobbelt (E-4).
export async function POST(request: NextRequest) {
  const hemmelighed = process.env.STRIPE_WEBHOOK_SECRET;
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!hemmelighed || !noegle) {
    return NextResponse.json({ fejl: "Stripe er ikke konfigureret" }, { status: 503 });
  }

  const signatur = request.headers.get("stripe-signature");
  if (!signatur) {
    return NextResponse.json({ fejl: "manglende signatur" }, { status: 400 });
  }

  const stripe = new Stripe(noegle);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signatur,
      hemmelighed,
    );
  } catch {
    return NextResponse.json({ fejl: "ugyldig signatur" }, { status: 400 });
  }

  const service = opretServiceKlient();
  const ledger = new SupabaseLedgerDb(service);
  const udfald = await haandterStripeEvent(ledger, event as StripeCheckoutEvent);

  // Gem Stripe-kunden på profilen (omsætnings-audit, punkt 2), så senere
  // abonnements-opslag ikke afhænger af at betalings-mailen matcher konto-
  // mailen. Best-effort: en fejl her må aldrig påvirke krediteringen.
  if (udfald.haandteret) {
    const objekt = (event as unknown as { data?: { object?: { customer?: unknown } } })
      .data?.object;
    const kundeId =
      typeof objekt?.customer === "string"
        ? objekt.customer
        : (objekt?.customer as { id?: string } | undefined)?.id;
    if (kundeId) {
      await bedstMuligt(async () => {
        const { gemStripeKunde } = await import("@/lib/betaling/abonnement");
        await gemStripeKunde(udfald.userId, kundeId);
      });
    }
  }

  // S32: kvitterings-supplement (Stripe sender selve kvitteringen). Best-effort:
  // ruten svarer 200 uanset mailen, så Stripe ikke gentager pga. den. Bemærk:
  // haandterStripeEvent returnerer haandteret=true også for en dublet-event
  // (krediteringen er no-op), så en sjælden ægte Stripe-dublet kan gentage
  // supplement-mailen. Ufarligt (kun et supplement), men fuld én-gang kræver at
  // tilfoej_kreditters "nyindsat"-signal føres op — se BACKLOG S34.
  // Kun engangskøb (pakke/top-up) får supplementet — for abonnementer sender
  // Stripe selv kvittering pr. faktura
  if (udfald.haandteret && udfald.slags !== "abonnement") {
    await bedstMuligt(async () => {
      const { data: profil } = await service
        .from("profiles")
        .select("email")
        .eq("id", udfald.userId)
        .maybeSingle();
      const pakke =
        udfald.slags === "topup"
          ? kreditter.topUp
          : kreditter.pakker.find((p) => p.antal === udfald.antal);
      const til = profil?.email as string | undefined;
      if (!til || !pakke) return;
      await sendKvittering(hentEmailAfsender(), {
        til,
        antal: udfald.antal,
        prisDkk: pakke.prisDkk,
        saldoUrl: `${site.baseUrl}/kreditter`,
      });
    });
  }

  return NextResponse.json(udfald);
}
