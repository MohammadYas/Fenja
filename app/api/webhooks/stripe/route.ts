import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { haandterStripeEvent, type StripeCheckoutEvent } from "@/lib/betaling/webhook";
import { SupabaseLedgerDb } from "@/lib/credits/supabase";
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

  const ledger = new SupabaseLedgerDb(opretServiceKlient());
  const udfald = await haandterStripeEvent(ledger, event as StripeCheckoutEvent);

  return NextResponse.json(udfald);
}
