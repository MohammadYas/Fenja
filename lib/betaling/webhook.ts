// Stripe-webhook-logik adskilt fra HTTP-laget, så den kan testes uden nøgler
// (E-2/E-4). Kreditering er idempotent pr. Stripe-event/faktura — dubletter er
// no-ops. Pricing v3.0: håndterer nu tre køb — pakker og top-up via Checkout
// (engangsbetaling) og abonnementskvoter via invoice.paid (Plus/Pro).

import { stripePriser } from "@/lib/config";
import {
  registrerAbonnementsKvote,
  registrerKoeb,
  registrerTopUp,
} from "@/lib/credits/ledger";
import type { LedgerDb } from "@/lib/credits/ledger";

export type StripeCheckoutEvent = {
  id: string;
  type: string;
  data: {
    object: {
      payment_status?: string;
      metadata?: Record<string, string>;
      // invoice.paid-felter (kun sat på fakturaer)
      id?: string;
      status?: string;
      subscription_details?: { metadata?: Record<string, string> };
      lines?: { data?: { price?: { id?: string } }[] };
    };
  };
};

export type WebhookUdfald =
  | { haandteret: true; slags: "pakke" | "topup"; userId: string; antal: number }
  | { haandteret: true; slags: "abonnement"; userId: string; tier: "plus" | "pro" }
  | { haandteret: false; grund: string };

// Testmode-pris-id'er (pladsholdere i lib/config.ts) → tier. Både måneds- og
// årsprisen giver månedskvoten; se BACKLOG S36 om årsabonnementets øvrige måneder.
const TIER_FOR_PRIS: Record<string, "plus" | "pro"> = {
  [stripePriser.plusMd]: "plus",
  [stripePriser.plusAar]: "plus",
  [stripePriser.proMd]: "pro",
  [stripePriser.proAar]: "pro",
};

async function haandterCheckout(
  ledger: LedgerDb,
  event: StripeCheckoutEvent,
): Promise<WebhookUdfald> {
  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return { haandteret: false, grund: "session ikke betalt" };
  }

  const userId = session.metadata?.userId;
  const antal = Number(session.metadata?.antalKreditter);
  if (!userId || !Number.isInteger(antal) || antal <= 0) {
    return { haandteret: false, grund: "manglende eller ugyldig metadata" };
  }

  // Uden koebstype behandles sessionen som pakkekøb (events fra før v3.0)
  if (session.metadata?.koebstype === "topup") {
    await registrerTopUp(ledger, userId, antal, event.id);
    return { haandteret: true, slags: "topup", userId, antal };
  }
  await registrerKoeb(ledger, userId, antal, event.id);
  return { haandteret: true, slags: "pakke", userId, antal };
}

async function haandterFaktura(
  ledger: LedgerDb,
  event: StripeCheckoutEvent,
): Promise<WebhookUdfald> {
  const faktura = event.data.object;
  if (faktura.status !== "paid") {
    return { haandteret: false, grund: "faktura ikke betalt" };
  }
  const userId = faktura.subscription_details?.metadata?.userId;
  if (!userId) {
    return { haandteret: false, grund: "faktura uden userId-metadata" };
  }
  const prisId = faktura.lines?.data?.[0]?.price?.id;
  const tier = prisId ? TIER_FOR_PRIS[prisId] : undefined;
  if (!tier) {
    return { haandteret: false, grund: `ukendt pris-id: ${prisId ?? "mangler"}` };
  }
  // Idempotent pr. faktura (én kvote pr. betalingsperiode) — Stripes gentagne
  // leveringsforsøg af samme event ER samme faktura
  await registrerAbonnementsKvote(ledger, userId, tier, faktura.id ?? event.id);
  return { haandteret: true, slags: "abonnement", userId, tier };
}

export async function haandterStripeEvent(
  ledger: LedgerDb,
  event: StripeCheckoutEvent,
): Promise<WebhookUdfald> {
  if (event.type === "checkout.session.completed") {
    return haandterCheckout(ledger, event);
  }
  if (event.type === "invoice.paid") {
    return haandterFaktura(ledger, event);
  }
  return { haandteret: false, grund: `ignoreret event-type: ${event.type}` };
}
