import Link from "next/link";
import { Taeller } from "@/components/taeller";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { SupplierKommerSnartKort } from "../suppliers/supplier-kommer-snart-kort";
import { ItemListe } from "./item-liste";

export const metadata = { title: `${da.oversigt.titel} · ${da.site.navn}` };

type ItemRaekke = {
  id: string;
  brand: string | null;
  titel: string | null;
  category: string | null;
  status: "draft" | "active" | "sold" | "failed";
  sold_price_dkk: number | null;
  leveret_at: string | null;
  solgt_at: string | null;
  created_at: string;
  generations: { status: string }[];
  item_photos: { role: string; original_url: string; cleaned_url: string | null }[];
};

// Miniature (ejer-ordre 20/8): man kan have flere af samme mærke — billedet
// gør listen genkendelig. Renset helhedsfoto først, ellers originalen.
async function miniatureUrl(fotos: ItemRaekke["item_photos"]): Promise<string | null> {
  const helhed = fotos.find((f) => f.role === "full") ?? fotos[0];
  const sti = helhed?.cleaned_url ?? helhed?.original_url;
  if (!sti) return null;
  if (sti.startsWith("http")) return sti;
  // Dynamisk: server-only-modulet må ikke evalueres i klient-test-kæden
  const { opretServiceKlient } = await import("@/lib/supabase/service");
  const service = opretServiceKlient();
  const { data } = await service.storage
    .from("item-photos")
    .createSignedUrl(sti, 3600);
  return data?.signedUrl ?? null;
}

// Item-bibliotek (B-7) + statistik (B-10): salgsværdi, antal, liggetid.
export default async function Oversigt() {
  const supabase = await opretServerKlient();

  // Onboarding-banner (ejer-ordre 20/8): indtil køn er valgt, mind om det —
  // fejltolerant før migration 20260820110000 (banner vises da bare ikke)
  let manglerOnboarding = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profil, error } = await supabase
        .from("profiles")
        .select("koen")
        .eq("id", user.id)
        .maybeSingle();
      manglerOnboarding = !error && profil != null && !profil.koen;
    }
  } catch {
    // Ingen auth i konteksten (fx tests) — så heller intet banner
  }
  const { data } = await supabase
    .from("items")
    .select(
      "id, brand, titel, category, status, sold_price_dkk, leveret_at, solgt_at, created_at, generations(status), item_photos(role, original_url, cleaned_url)",
    )
    .order("created_at", { ascending: false });
  const items = (data ?? []) as ItemRaekke[];
  const miniaturer = await Promise.all(
    items.map((item) => miniatureUrl(item.item_photos ?? [])),
  );

  const solgte = items.filter((i) => i.status === "sold");
  const samletVaerdi = solgte.reduce((sum, i) => sum + (i.sold_price_dkk ?? 0), 0);
  const liggetider = solgte
    .filter((i) => i.leveret_at && i.solgt_at)
    .map(
      (i) =>
        (new Date(i.solgt_at!).getTime() - new Date(i.leveret_at!).getTime()) /
        86_400_000,
    );
  const snitLiggetid =
    liggetider.length > 0
      ? Math.max(1, Math.round(liggetider.reduce((a, b) => a + b, 0) / liggetider.length))
      : null;

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.oversigt.titel}
      </h1>

      <SupplierKommerSnartKort />

      {manglerOnboarding ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-bloed border border-kant bg-flade p-4">
          <p className="max-w-laesbar text-tekst/80">{da.onboarding.bannerTekst}</p>
          <Link href="/onboarding" className="knap-link px-5">
            {da.onboarding.bannerKnap}
          </Link>
        </div>
      ) : null}

      {items.length === 0 ? (
        // Tom tilstand som gran-blok (REDESIGN §2.2)
        <div className="mt-6 rounded-bloed bg-gran p-6 text-kalk">
          <p className="max-w-laesbar">{da.oversigt.tom}</p>
          <Link href="/nyt-item" className="knap-link knap-link-lys mt-6 px-5">
            {da.oversigt.foersteKnap}
          </Link>
        </div>
      ) : (
        <>
          {solgte.length > 0 ? (
            // Statistik som gran-blok med kæmpe mono-tal — "solgt for X kr." er
            // heltestallet, og det tæller op (REDESIGN §3.5/§2.5)
            <section
              className="mt-6 rounded-bloed bg-gran p-5 text-kalk"
              aria-label={da.oversigt.statistikTitel}
            >
              <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
                {da.oversigt.statistikTitel}
              </p>
              <p className="mt-3 font-mono text-kaempe font-bold leading-none">
                <Taeller til={samletVaerdi} /> kr.
              </p>
              <p className="mt-3 text-detalje text-hoer">
                {da.oversigt.solgtMedSelja} · {da.oversigt.solgteAntal(solgte.length)}
                {snitLiggetid != null
                  ? ` · ${da.oversigt.liggetid(snitLiggetid)}`
                  : null}
              </p>
            </section>
          ) : null}

          <ItemListe
            items={items.map((item, i) => ({
              id: item.id,
              titel:
                item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
              // Bulletproof (ejer-ordre 20/8): en fejlet kørsel vises ærligt —
              // man åbner annoncen og kører den igen derfra
              status: item.status === "failed" ? "draft" : item.status,
              fejlet: item.status === "failed" && !item.leveret_at,
              soldPrisDkk: item.sold_price_dkk,
              miniature: miniaturer[i] ?? null,
              // B-9: en kladde med kørende pipeline er "på vej", ikke efterladt
              paaVej:
                item.status === "draft" &&
                !item.leveret_at &&
                (item.generations ?? []).length > 0,
              // Ejer-ordre 20/8: fremdriften vises OGSÅ på oversigten —
              // kurven er forankret i starttiden og står derfor øjeblikkeligt
              // præcis hvor den var
              startetAt: item.created_at,
            }))}
          />
        </>
      )}
    </main>
  );
}
