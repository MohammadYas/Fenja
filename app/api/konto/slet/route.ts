import { NextResponse } from "next/server";
import Stripe from "stripe";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "item-photos";

// Aktive Stripe-abonnementer opsiges ved kontosletning (vilkårenes løfte).
// Best-effort: sletningen må aldrig fejle på Stripe — kunden kan altid
// opsige selv via Stripes kvitteringsmails/portal.
async function opsigAbonnementer(email: string): Promise<void> {
  const noegle = process.env.STRIPE_SECRET_KEY;
  if (!noegle) return;
  try {
    const stripe = new Stripe(noegle);
    const kunder = await stripe.customers.list({ email, limit: 3 });
    for (const kunde of kunder.data) {
      const abonnementer = await stripe.subscriptions.list({
        customer: kunde.id,
        status: "active",
        limit: 10,
      });
      for (const abonnement of abonnementer.data) {
        await stripe.subscriptions.cancel(abonnement.id);
      }
    }
  } catch {
    // bevidst slugt — sletningen fortsætter
  }
}

// Fuld sletning (A-4/GDPR): alle billeder i storage, alle rækker (cascade fra
// auth.users → profiles → items → fotos/generations/ledger) og selve brugeren.
export async function POST() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  }

  const service = opretServiceKlient();

  // Abonnement stoppes før data, så der ikke trækkes penge efter sletningen
  if (user.email) await opsigAbonnementer(user.email);

  // Storage først: list og slet alle filer under brugerens mappe
  const filer: string[] = [];
  const { data: mapper } = await service.storage.from(BUCKET).list(user.id);
  for (const mappe of mapper ?? []) {
    const { data: indhold } = await service.storage
      .from(BUCKET)
      .list(`${user.id}/${mappe.name}`);
    for (const fil of indhold ?? []) {
      filer.push(`${user.id}/${mappe.name}/${fil.name}`);
    }
    if (mappe.id) filer.push(`${user.id}/${mappe.name}`);
  }
  if (filer.length > 0) {
    await service.storage.from(BUCKET).remove(filer);
  }

  // Sletter auth-brugeren; databasen rydder resten via on delete cascade
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
