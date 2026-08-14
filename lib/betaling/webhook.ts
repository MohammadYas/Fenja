// Stripe-webhook-logik adskilt fra HTTP-laget, så den kan testes uden nøgler
// (E-2/E-4). Kreditering er idempotent pr. Stripe-event-id — dubletter er no-ops.

import { registrerKoeb } from "@/lib/credits/ledger";
import type { LedgerDb } from "@/lib/credits/ledger";

export type StripeCheckoutEvent = {
  id: string;
  type: string;
  data: {
    object: {
      payment_status?: string;
      metadata?: Record<string, string>;
    };
  };
};

export type WebhookUdfald =
  | { haandteret: true; userId: string; antal: number }
  | { haandteret: false; grund: string };

export async function haandterStripeEvent(
  ledger: LedgerDb,
  event: StripeCheckoutEvent,
): Promise<WebhookUdfald> {
  if (event.type !== "checkout.session.completed") {
    return { haandteret: false, grund: `ignoreret event-type: ${event.type}` };
  }
  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return { haandteret: false, grund: "session ikke betalt" };
  }

  const userId = session.metadata?.userId;
  const antal = Number(session.metadata?.antalKreditter);
  if (!userId || !Number.isInteger(antal) || antal <= 0) {
    return { haandteret: false, grund: "manglende eller ugyldig metadata" };
  }

  await registrerKoeb(ledger, userId, antal, event.id);
  return { haandteret: true, userId, antal };
}
