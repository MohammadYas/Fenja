import { NextResponse } from "next/server";
import {
  byggDataeksport,
  eksportFilnavn,
  stierIItems,
  type RaaItem,
  type RaaKredit,
  type RaaProfil,
} from "@/lib/konto/eksport";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

const BUCKET = "item-photos";
/** Billedlinkene i filen udløber efter en time — teksten i da.ts siger det samme */
const LINK_SEKUNDER = 3600;

// Indsigt + dataportabilitet som selvbetjening (GDPR art. 15/20).
// Alle rækker læses som brugeren selv, så RLS er den egentlige adgangskontrol;
// service-nøglen bruges KUN til at signere links til stier, brugeren ejer.
export async function GET() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ fejl: "ikke logget ind" }, { status: 401 });
  }

  const [{ data: profil }, { data: items }, { data: kreditter }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, created_at, age_confirmed, home_anchor")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("items")
      .select(
        "id, created_at, status, brand, size, condition, category, defects_text, purchase_price_dkk, titel, beskrivelse, soegeord, pris_fra_dkk, pris_til_dkk, pris_begrundelse, leveret_at, solgt_at, sold_price_dkk, item_photos(role, original_url, cleaned_url), generations(kind, status, created_at, prompt_version, fidelity_score)",
      )
      .eq("user_id", user.id),
    supabase
      .from("credit_ledger")
      .select("ts, delta, reason, source, expires_at, stripe_ref")
      .eq("user_id", user.id),
  ]);

  const raaItems = (items ?? []) as unknown as RaaItem[];

  // Kun stier under brugerens egen mappe signeres — et manipuleret item_photos-
  // felt må aldrig kunne give adgang til en anden brugers billeder
  const stier = stierIItems(raaItems).filter((sti) => sti.startsWith(`${user.id}/`));
  const links: Record<string, string | null> = {};
  if (stier.length > 0) {
    const service = opretServiceKlient();
    const { data: signerede } = await service.storage
      .from(BUCKET)
      .createSignedUrls(stier, LINK_SEKUNDER);
    for (const raekke of signerede ?? []) {
      if (raekke.path) links[raekke.path] = raekke.signedUrl ?? null;
    }
  }

  const eksporteret = new Date().toISOString();
  const eksport = byggDataeksport({
    profil: (profil ?? null) as RaaProfil | null,
    items: raaItems,
    kreditter: (kreditter ?? []) as unknown as RaaKredit[],
    links,
    eksporteret,
  });

  return new NextResponse(JSON.stringify(eksport, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${eksportFilnavn(eksporteret)}"`,
      // Persondata må aldrig ligge i en delt cache
      "Cache-Control": "private, no-store",
    },
  });
}
