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

// Hvilken tier har brugeren? (21/8: Pro-funktioner skal gates på tier, ikke
// kun "abonnent"). Slås op via prisens lookup_key (selja_plus_*/selja_pro_*).
// null = intet aktivt abonnement. Fejlsikker: Stripe nede → null.
export async function hentAbonnementsTier(
  email: string,
): Promise<"plus" | "pro" | null> {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) return null;
  try {
    const stripe = new Stripe(noegle);
    const { data: kunder } = await stripe.customers.list({ email, limit: 5 });
    for (const kunde of kunder) {
      for (const status of ["active", "trialing"] as const) {
        const { data: abonnementer } = await stripe.subscriptions.list({
          customer: kunde.id,
          status,
          limit: 3,
          expand: ["data.items.data.price"],
        });
        for (const abonnement of abonnementer) {
          const lookup = abonnement.items.data[0]?.price?.lookup_key ?? "";
          if (lookup.startsWith("selja_pro")) return "pro";
          if (lookup.startsWith("selja_plus")) return "plus";
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}
