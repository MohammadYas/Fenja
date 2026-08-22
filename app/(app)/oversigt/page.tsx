import Link from "next/link";
import { Taeller } from "@/components/taeller";
import { da } from "@/lib/copy/da";
import { bygSaesonKalender } from "@/lib/salg/kalender";
import { bygKonkurrentTjek } from "@/lib/salg/konkurrent";
import { bygRadar } from "@/lib/salg/radar";
import { bygSalgsplan, type SalgsPunkt } from "@/lib/salg/smart-plan";
import { bygSalgsstatistik } from "@/lib/salg/statistik";
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
  pris_fra_dkk: number | null;
  pris_til_dkk: number | null;
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

  // Auth fejltolerant (mock-kæder i tests har ingen auth-del)
  let user: { id: string; email?: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  // Onboarding-banner (ejer-ordre 20/8): indtil køn er valgt, mind om det —
  // fejltolerant før migration 20260820110000 (banner vises da bare ikke)
  let manglerOnboarding = false;
  if (user) {
    try {
      const { data: profil, error } = await supabase
        .from("profiles")
        .select("koen")
        .eq("id", user.id)
        .maybeSingle();
      manglerOnboarding = !error && profil != null && !profil.koen;
    } catch {
      // Ingen auth i konteksten (fx tests) — så heller intet banner
    }
  }
  const { data } = await supabase
    .from("items")
    .select(
      "id, brand, titel, category, status, sold_price_dkk, leveret_at, solgt_at, created_at, pris_fra_dkk, pris_til_dkk, generations(status), item_photos(role, original_url, cleaned_url)",
    )
    .order("created_at", { ascending: false });
  const items = (data ?? []) as ItemRaekke[];
  const miniaturer = await Promise.all(
    items.map((item) => miniatureUrl(item.item_photos ?? [])),
  );

  // Smart Salgsplan (ejer-ordre 20/8) — KUN for abonnenter. Fejltolerant:
  // kan abonnementsstatus ikke læses (demo/nedbrud), skjules blokken.
  // Server-only-moduler importeres dynamisk, så oversigt-siden også kan
  // evalueres i klient-test-kæder uden service-klienten.
  let salgplan: SalgsPunkt[] = [];
  let erAbonnent = false;
  // Tier styrer Pro-funktioner (konkurrent-tjek). Ledger siger "abonnent",
  // Stripe siger hvilken — kan tieren ikke læses, behandles man som plus.
  let tier: "plus" | "pro" = "plus";
  if (user) {
    try {
      const { SupabaseLedgerDb } = await import("@/lib/credits/supabase");
      const { opretServiceKlient } = await import("@/lib/supabase/service");
      const ledger = new SupabaseLedgerDb(opretServiceKlient());
      const status = await ledger.hentStatus(user.id);
      erAbonnent = status.prKilde.subscription > 0;
      if (erAbonnent && user.email) {
        const { hentAbonnementsTier } = await import("@/lib/betaling/abonnement");
        tier = (await hentAbonnementsTier(user.email)) ?? "plus";
      }
      if (erAbonnent) {
        salgplan = bygSalgsplan(
          items.map((item) => ({
            id: item.id,
            titel: item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
            maerke: item.brand ?? "",
            kategori: item.category ?? "",
            status: item.status === "failed" ? "draft" : item.status,
            leveretAt: item.leveret_at,
            prisTilDkk: item.pris_til_dkk,
            // Kladde med kørende pipeline rådgives ikke — den er ikke klar endnu
            paaVej:
              item.status === "draft" &&
              !item.leveret_at &&
              (item.generations ?? []).length > 0,
          })),
        );
      }
    } catch {
      salgplan = [];
      erAbonnent = false;
    }
  }

  // Garderobe-radar + statistik (abonnent, 21/8) — rene funktioner over
  // annoncerne og den committede markedshøst
  const statistik = bygSalgsstatistik(
    items.map((item) => ({
      status: item.status === "failed" ? "draft" : item.status,
      soldPrisDkk: item.sold_price_dkk,
      solgtAt: item.solgt_at,
      leveretAt: item.leveret_at,
      createdAt: item.created_at,
      maerke: item.brand ?? "",
      kategori: item.category ?? "",
      prisTilDkk: item.pris_til_dkk,
    })),
  );
  const radar = erAbonnent ? bygRadar() : [];
  // Sæson-kalender (alle abonnenter) + konkurrent-tjek (kun Pro), 21/8
  const planInput = items.map((item) => ({
    id: item.id,
    titel: item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
    maerke: item.brand ?? "",
    kategori: item.category ?? "",
    status: (item.status === "failed" ? "draft" : item.status) as
      | "draft"
      | "active"
      | "sold",
    prisTilDkk: item.pris_til_dkk,
  }));
  const kalender = erAbonnent
    ? bygSaesonKalender(planInput).filter((m) => m.erNu || m.titler.length > 0)
    : [];
  const konkurrent = erAbonnent && tier === "pro" ? bygKonkurrentTjek(planInput) : [];

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

      {/* Smart Salgsplan (ejer-ordre 20/8): abonnent-fordelen — konkrete,
          udregnede råd, eller en teaser der viser hvad abonnenter får */}
      {erAbonnent && salgplan.length > 0 ? (
        <section className="mt-6 rounded-bloed bg-gran p-5 text-kalk" aria-label={da.oversigt.salgplanTitel}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
              {da.oversigt.salgplanTitel}
            </p>
            <p className="font-mono text-detalje uppercase tracking-wide text-kalk/60">
              {da.oversigt.salgplanStempel}
            </p>
          </div>
          <p className="mt-1 max-w-laesbar text-detalje text-kalk/80">
            {da.oversigt.salgplanLead}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {salgplan.map((punkt) => (
              <li
                key={punkt.itemId}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-bloed border border-kalk/20 bg-kalk/5 p-3"
              >
                <div className="max-w-laesbar">
                  <p className="font-mono text-detalje font-bold text-rav">
                    {da.oversigt.salgplanHandling[punkt.handling]}
                  </p>
                  <p className="mt-0.5 font-medium">{punkt.titel}</p>
                  <p className="mt-0.5 text-detalje text-kalk/80">{punkt.tekst}</p>
                </div>
                {punkt.foreslaaetPrisDkk != null ? (
                  <p className="font-mono text-titel font-bold text-kalk">
                    {punkt.foreslaaetPrisDkk} kr.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : !erAbonnent ? (
        <section className="mt-6 rounded-bloed border border-kant bg-flade p-5" aria-label={da.oversigt.salgplanTeaserTitel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-laesbar">
              <p className="font-display text-lead font-semibold">
                {da.oversigt.salgplanTeaserTitel}
              </p>
              <p className="mt-1 text-detalje text-tekst/80">
                {da.oversigt.salgplanTeaserTekst}
              </p>
            </div>
            <Link href="/kreditter" className="knap-link px-5">
              {da.oversigt.salgplanTeaserKnap}
            </Link>
          </div>
        </section>
      ) : null}

      {/* Garderobe-radar (abonnent-fordel, 21/8): garderobens forventede
          værdi + hvad der er værd at source lige nu, vægtet med sæsonen */}
      {erAbonnent ? (
        <section
          className="mt-6 rounded-bloed border border-kant bg-flade p-5"
          aria-label={da.oversigt.radar.titel}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.radar.titel}
            </p>
            <p className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
              {da.oversigt.salgplanStempel}
            </p>
          </div>
          {statistik.aktivAntal > 0 ? (
            <p className="mt-3 max-w-laesbar text-detalje text-tekst/80">
              {da.oversigt.radar.garderobeVaerdi(
                statistik.aktivAntal,
                Math.round(statistik.aktivVaerdiDkk),
              )}
              {statistik.bedsteKategori
                ? ` ${da.oversigt.radar.bedsteKategori(
                    statistik.bedsteKategori.navn,
                    Math.round(statistik.bedsteKategori.sumDkk),
                  )}`
                : null}
            </p>
          ) : null}
          <p className="mt-3 font-medium">{da.oversigt.radar.sourcingTitel}</p>
          <ul className="mt-2 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {radar.map((punkt) => (
              <li
                key={`${punkt.maerke}-${punkt.kategori}`}
                className="flex items-baseline justify-between gap-4 border-b border-kant py-2 text-detalje"
              >
                <span className="min-w-0">
                  <span className="font-medium">
                    {punkt.maerke} {punkt.kategori}
                  </span>{" "}
                  <span className={punkt.iSaeson ? "text-gran" : "text-tekst/60"}>
                    · {punkt.saesonTekst}
                  </span>
                </span>
                <span className="shrink-0 font-mono">
                  ~{punkt.medianDkk} kr.
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-detalje text-tekst/60">
            {da.oversigt.radar.note}
          </p>
        </section>
      ) : null}

      {/* Sæson-kalender (alle abonnenter, 21/8): garderobens 12 måneder */}
      {erAbonnent && kalender.length > 0 ? (
        <section
          className="mt-6 rounded-bloed border border-kant bg-flade p-5"
          aria-label={da.oversigt.kalender.titel}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.kalender.titel}
            </p>
            <p className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
              {da.oversigt.salgplanStempel}
            </p>
          </div>
          <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
            {da.oversigt.kalender.lead}
          </p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {kalender.map((m) => (
              <li key={m.maaned} className="border-b border-kant py-2 text-detalje">
                <span className={`font-mono font-bold ${m.erNu ? "text-gran" : "text-tekst/70"}`}>
                  {m.navn}
                  {m.erNu ? ` · ${da.oversigt.kalender.nu}` : ""}
                </span>{" "}
                <span className="text-tekst/80">
                  {m.titler.length > 0
                    ? m.titler.join(" · ") +
                      (m.flere > 0 ? ` · +${m.flere}` : "")
                    : da.oversigt.kalender.tomMaaned}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Konkurrent-tjek (KUN Pro, 21/8): din pris mod markedets kvartiler */}
      {konkurrent.length > 0 ? (
        <section
          className="mt-6 rounded-bloed border border-kant bg-flade p-5"
          aria-label={da.oversigt.konkurrent.titel}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.konkurrent.titel}
            </p>
            <p className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
              {da.oversigt.konkurrent.stempel}
            </p>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {konkurrent.map((punkt) => (
              <li key={punkt.itemId} className="border-b border-kant pb-3 text-detalje">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{punkt.titel}</span>
                  <span className="font-mono">
                    {da.oversigt.konkurrent.dinPris(punkt.dinPrisDkk)} ·{" "}
                    {da.oversigt.konkurrent.marked(punkt.p25Dkk, punkt.p75Dkk)}
                  </span>
                </div>
                <p className="mt-1 text-tekst/80">{punkt.tekst}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-detalje text-tekst/60">
            {da.oversigt.konkurrent.note}
          </p>
        </section>
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
