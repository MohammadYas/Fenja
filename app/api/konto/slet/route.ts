import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sletBrugerensFiler, type StorageOprydning } from "@/lib/konto/slet";
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

  // Storage først: ALLE filer under brugerens mappe, pagineret — en sælger med
  // over 100 annoncer må ikke få billeder efterladt efter en "fuld sletning"
  try {
    await sletBrugerensFiler(
      service.storage.from(BUCKET) as unknown as StorageOprydning,
      user.id,
    );
  } catch (fejl) {
    // Fejler storage, må auth-brugeren IKKE slettes: så ville billederne blive
    // forældreløse i bucket'en uden nogen til at rydde op
    return NextResponse.json(
      { fejl: fejl instanceof Error ? fejl.message : "sletning fejlede" },
      { status: 500 },
    );
  }

  // Sletter auth-brugeren; databasen rydder resten via on delete cascade
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ fejl: error.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
