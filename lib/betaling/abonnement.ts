import "server-only";

import Stripe from "stripe";
import { opretServiceKlient } from "@/lib/supabase/service";

// Abonnements-opslag mod Stripe. Sandheden bor hos Stripe.
//
// NØGLEN ER KUNDE-ID (omsætnings-audit 21/8, punkt 2): opslaget hang før
// udelukkende på e-mail-match. Betalte en kunde med en anden adresse end sin
// Selja-konto (Apple/Google-relay, familiens kort), mistede de ALLE
// abonnent-fordele selvom pengene var trukket. Kunde-id'et gemmes ved
// checkout på profilen; e-mail er kun fallback for gamle kunder.
//
// OPSIGELSE (lovkrav, ejer 22/8): et opsagt abonnement beholder adgangen
// perioden ud. Det håndteres af Stripe selv — cancel_at_period_end lader
// abonnementet blive i status "active" indtil current_period_end, og først
// derefter bliver det "canceled". Vi tjekker derfor netop active/trialing.
const AKTIVE_STATUS = ["active", "trialing"] as const;

/** Kunde-id fra profilen (primær), ellers e-mail-opslag hos Stripe */
async function hentKundeIder(stripe: Stripe, email: string): Promise<string[]> {
  const ider: string[] = [];
  try {
    const service = opretServiceKlient();
    const { data } = await service
      .from("profiles")
      .select("stripe_customer_id")
      .eq("email", email)
      .maybeSingle();
    const gemt = data?.stripe_customer_id as string | null | undefined;
    if (gemt) ider.push(gemt);
  } catch {
    // Kolonnen findes ikke endnu, eller service-klienten mangler — fald
    // tilbage til e-mail-opslaget nedenfor
  }
  try {
    const { data: kunder } = await stripe.customers.list({ email, limit: 5 });
    for (const kunde of kunder) if (!ider.includes(kunde.id)) ider.push(kunde.id);
  } catch {
    // Stripe nede — arbejd videre med det, vi har
  }
  return ider;
}

/** Gemmer kunde-id'et på profilen, så senere opslag ikke afhænger af e-mail */
export async function gemStripeKunde(userId: string, kundeId: string): Promise<void> {
  try {
    const service = opretServiceKlient();
    await service
      .from("profiles")
      .update({ stripe_customer_id: kundeId })
      .eq("id", userId);
  } catch {
    // Ikke-kritisk: e-mail-fallback dækker stadig
  }
}

export async function harAktivtAbonnement(email: string): Promise<boolean> {
  return (await hentAbonnementsTier(email)) !== null;
}

// Hvilken tier har brugeren? Slås op via prisens lookup_key
// (selja_plus_*/selja_pro_*). null = intet aktivt abonnement.
// Fejlsikker: Stripe nede → null (hellere nægte end at give gratis adgang).
export async function hentAbonnementsTier(
  email: string,
): Promise<"plus" | "pro" | null> {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) return null;
  try {
    const stripe = new Stripe(noegle);
    const kundeIder = await hentKundeIder(stripe, email);
    for (const kundeId of kundeIder) {
      for (const status of AKTIVE_STATUS) {
        const { data: abonnementer } = await stripe.subscriptions.list({
          customer: kundeId,
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
