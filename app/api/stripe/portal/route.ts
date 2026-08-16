import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";

// Stripes kundeportal: skift kort, se fakturaer, opsig abonnement. Kunden
// slås op på e-mail (checkout bruger customer_email) — findes ingen, svares
// ærligt 404. Uden nøgle svarer ruten 503 ligesom checkout.
export async function POST(request: NextRequest) {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) {
    return NextResponse.json({ fejl: da.kreditter.betalingIkkeKlar }, { status: 503 });
  }

  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  }

  const stripe = new Stripe(noegle);
  const kunder = await stripe.customers.list({ email: user.email, limit: 1 });
  const kunde = kunder.data[0];
  if (!kunde) {
    return NextResponse.json({ fejl: da.kreditter.abonnementIngen }, { status: 404 });
  }

  const oprindelse = request.headers.get("origin") ?? request.nextUrl.origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: kunde.id,
    return_url: `${oprindelse}/kreditter`,
  });
  return NextResponse.json({ url: session.url });
}
