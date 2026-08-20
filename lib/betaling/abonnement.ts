import "server-only";

import Stripe from "stripe";

// Har brugeren et aktivt Selja-abonnement? (Ejer-ordre 2026-08-20: top-up
// må KUN købes af abonnenter.) Sandheden bor hos Stripe — vi slår kunden op
// på e-mail og tjekker for aktive/prøveperiode-abonnementer. Uden Stripe-nøgle
// (lokalt/demo) svares false; betaling er alligevel utilgængelig dér.
export async function harAktivtAbonnement(email: string): Promise<boolean> {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) return false;
  try {
    const stripe = new Stripe(noegle);
    const { data: kunder } = await stripe.customers.list({ email, limit: 5 });
    for (const kunde of kunder) {
      const { data: abonnementer } = await stripe.subscriptions.list({
        customer: kunde.id,
        status: "active",
        limit: 1,
      });
      if (abonnementer.length > 0) return true;
      const { data: proeve } = await stripe.subscriptions.list({
        customer: kunde.id,
        status: "trialing",
        limit: 1,
      });
      if (proeve.length > 0) return true;
    }
    return false;
  } catch {
    // Stripe nede → hellere nægte top-up end at bryde reglen
    return false;
  }
}
