import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// Stripe Checkout til kreditpakker (E-2/E-6): dansk B2C med automatisk moms
// og kvittering fra Stripe. Uden nøgler svarer ruten ærligt 503.
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

  const krop = (await request.json()) as { pakkeId?: string };
  const pakke = kreditter.pakker.find((p) => p.id === krop.pakkeId);
  if (!pakke) return NextResponse.json({ fejl: "ukendt pakke" }, { status: 400 });

  const oprindelse = request.headers.get("origin") ?? request.nextUrl.origin;
  const stripe = new Stripe(noegle);
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
    },
    success_url: `${oprindelse}/kreditter?status=succes`,
    cancel_url: `${oprindelse}/kreditter?status=afbrudt`,
  });

  return NextResponse.json({ url: session.url });
}
