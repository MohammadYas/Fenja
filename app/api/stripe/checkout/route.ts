import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { abonnementer, kreditter, site, stripePriser } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// Stripe Checkout (E-2/E-6): dansk B2C med automatisk moms og kvittering fra
// Stripe. Uden nøgler svarer ruten ærligt 503. Pricing v3.0: pakker + top-up
// som engangsbetaling (inline price_data) og Plus/Pro som abonnement (pris-id
// fra config — testmode-pladsholdere indtil ejeren opretter de rigtige).
export async function POST(request: NextRequest) {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) {
    return NextResponse.json({ fejl: da.kreditter.betalingIkkeKlar }, { status: 503 });
  }

  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });

  const krop = (await request.json()) as {
    pakkeId?: string;
    abonnement?: string;
    periode?: string;
  };
  // Origin-headeren er angriberstyret — brug den kun hvis den er en af vores
  // egne (ellers kunne success/cancel sende kunden til et fremmed domæne
  // efter betaling). Fallback: den konfigurerede base-URL.
  const origin = request.headers.get("origin");
  const oprindelse =
    origin && [site.baseUrl, "http://localhost:3000"].includes(origin)
      ? origin
      : site.baseUrl;
  const stripe = new Stripe(noegle);

  // Abonnement (Plus/Pro, md./år) — kvoten leveres af webhookens invoice.paid
  if (krop.abonnement) {
    const tier = abonnementer.tiers.find((t) => t.id === krop.abonnement);
    if (!tier) return NextResponse.json({ fejl: "ukendt abonnement" }, { status: 400 });
    const pris =
      tier.id === "plus"
        ? (krop.periode === "aar" ? stripePriser.plusAar : stripePriser.plusMd)
        : (krop.periode === "aar" ? stripePriser.proAar : stripePriser.proMd);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: pris, quantity: 1 }],
      automatic_tax: { enabled: true },
      // userId på abonnementet, så invoice.paid kan kreditere kvoten
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${oprindelse}/kreditter?status=succes`,
      cancel_url: `${oprindelse}/kreditter?status=afbrudt`,
    });
    return NextResponse.json({ url: session.url });
  }

  // Engangskøb: pakke eller top-up ("Fyld op")
  const erTopUp = krop.pakkeId === kreditter.topUp.id;
  const pakke = erTopUp
    ? kreditter.topUp
    : kreditter.pakker.find((p) => p.id === krop.pakkeId);
  if (!pakke) return NextResponse.json({ fejl: "ukendt pakke" }, { status: 400 });

  // Ejer-ordre 22/8: ABONNEMENT KRÆVES for alle kreditkøb. Pakkerne er
  // top-up for abonnenter, ikke en vej udenom abonnementet — og tjekket
  // ligger HER på serveren, ikke kun i UI'et, så ruten ikke kan kaldes
  // direkte af en ikke-abonnent.
  {
    const { harAktivtAbonnement } = await import("@/lib/betaling/abonnement");
    if (!user.email || !(await harAktivtAbonnement(user.email))) {
      return NextResponse.json(
        { fejl: da.kreditter.topUp.kunAbonnenter },
        { status: 403 },
      );
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "dkk",
          unit_amount: pakke.prisDkk * 100,
          product_data: {
            name: da.kreditter.pakkeNavn(pakke.antal),
          },
        },
        quantity: 1,
      },
    ],
    automatic_tax: { enabled: true },
    metadata: {
      userId: user.id,
      antalKreditter: String(pakke.antal),
      koebstype: erTopUp ? "topup" : "pakke",
    },
    success_url: `${oprindelse}/kreditter?status=succes`,
    cancel_url: `${oprindelse}/kreditter?status=afbrudt`,
  });

  return NextResponse.json({ url: session.url });
}
