import Link from "next/link";
import { BundleBygger } from "@/components/bundle-bygger";
import { Taeller } from "@/components/taeller";
import { da } from "@/lib/copy/da";
import { bygAnnonceDoktor, DOKTOR_PLUS_ANTAL } from "@/lib/salg/doktor";
import { bygFlipBeregner } from "@/lib/salg/flip";
import { bygSaesonKalender } from "@/lib/salg/kalender";
import { bygKonkurrentTjek } from "@/lib/salg/konkurrent";
import { bygPrisTrappe } from "@/lib/salg/pristrappe";
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

  // Trial-claim (kodereview 25/8): signede man op, MENS trialen stadig
  // kørte, sprang login-claimet den over — oversigten samler op, så
  // resultatet lander på kontoen, så snart det er færdigt. Best-effort og
  // idempotent (claimed_by sættes kun én gang); må aldrig vælte siden.
  if (user) {
    try {
      // Dynamisk import: modulerne er server-only, og siden skal stadig
      // kunne renderes i tests uden servermiljø
      const { opretServiceKlient } = await import("@/lib/supabase/service");
      const { claimTrialVedLogin } = await import("@/lib/trial/claim");
      await claimTrialVedLogin(opretServiceKlient(), user.id);
    } catch {
      // demo/test-miljø uden service-nøgle — claim springes over
    }
  }

  // Hastighed (ejer 22/8: "langsomt fra menu til menu"): profil-tjek,
  // annonce-listen og kreditstatus er uafhængige opslag — de hentes
  // PARALLELT i stedet for i serie. Fejltolerancen pr. opslag er bevaret:
  // mock-kæder i tests og demo-tilstand falder stille tilbage.

  // Onboarding-banner (ejer-ordre 20/8): indtil køn er valgt, mind om det —
  // fejltolerant før migration 20260820110000 (banner vises da bare ikke)
  const profilLoefte: Promise<boolean> = user
    ? (async () => {
        try {
          const { data: profil, error } = await supabase
            .from("profiles")
            .select("koen")
            .eq("id", user.id)
            .maybeSingle();
          return !error && profil != null && !profil.koen;
        } catch {
          // Ingen auth i konteksten (fx tests) — så heller intet banner
          return false;
        }
      })()
    : Promise.resolve(false);

  // Abonnent-status fra ledgeren. Server-only-moduler importeres dynamisk,
  // så oversigt-siden også kan evalueres i klient-test-kæder uden service-klienten.
  const ledgerLoefte: Promise<boolean> = user
    ? (async () => {
        try {
          const { SupabaseLedgerDb } = await import("@/lib/credits/supabase");
          const { opretServiceKlient } = await import("@/lib/supabase/service");
          const ledger = new SupabaseLedgerDb(opretServiceKlient());
          const status = await ledger.hentStatus(user.id);
          return status.prKilde.subscription > 0;
        } catch {
          return false;
        }
      })()
    : Promise.resolve(false);

  const [manglerOnboarding, itemsSvar, erAbonnent] = await Promise.all([
    profilLoefte,
    supabase
      .from("items")
      .select(
        "id, brand, titel, category, status, sold_price_dkk, leveret_at, solgt_at, created_at, pris_fra_dkk, pris_til_dkk, generations(status), item_photos(role, original_url, cleaned_url)",
      )
      .order("created_at", { ascending: false }),
    ledgerLoefte,
  ]);
  const items = ((itemsSvar?.data ?? []) as ItemRaekke[]);

  // Miniaturer (signerede URLs) og Stripe-tieren er også uafhængige — parallelt.
  // Tier styrer Pro-funktioner (konkurrent-tjek). Ledger siger "abonnent",
  // Stripe siger hvilken — kan tieren ikke læses, behandles man som plus.
  const [miniaturer, tier] = await Promise.all([
    Promise.all(items.map((item) => miniatureUrl(item.item_photos ?? []))),
    (async (): Promise<"plus" | "pro"> => {
      if (!erAbonnent || !user?.email) return "plus";
      try {
        const { hentAbonnementsTier } = await import("@/lib/betaling/abonnement");
        return (await hentAbonnementsTier(user.email)) ?? "plus";
      } catch {
        return "plus";
      }
    })(),
  ]);

  // Smart Salgsplan (ejer-ordre 20/8) — KUN for abonnenter
  let salgplan: SalgsPunkt[] = [];
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
  // Pris-trappe (alle abonnenter, 22/8): nedtrapningsplanen pr. aktiv annonce
  const trapper = erAbonnent
    ? bygPrisTrappe(
        items.map((item) => ({
          id: item.id,
          titel: item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
          maerke: item.brand ?? "",
          kategori: item.category ?? "",
          status: (item.status === "failed" ? "draft" : item.status) as
            | "draft"
            | "active"
            | "sold",
          leveretAt: item.leveret_at,
          prisTilDkk: item.pris_til_dkk,
        })),
      )
    : [];
  // Flip-beregner (KUN Pro, 22/8): maks indkøbspris + forventet gevinst
  const flip = erAbonnent && tier === "pro" ? bygFlipBeregner() : [];
  // Annonce-doktor (22/8): sundhedstjek pr. aktiv annonce — Plus ser de 3,
  // der trænger mest, Pro ser alle
  const doktorAlle = erAbonnent
    ? bygAnnonceDoktor(
        items.map((item) => ({
          id: item.id,
          titel: item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim(),
          maerke: item.brand ?? "",
          kategori: item.category ?? "",
          status: (item.status === "failed" ? "draft" : item.status) as
            | "draft"
            | "active"
            | "sold",
          leveretAt: item.leveret_at,
          prisTilDkk: item.pris_til_dkk,
          fotoRoller: (item.item_photos ?? []).map((foto) => foto.role),
        })),
      )
    : [];
  const doktor =
    tier === "pro" ? doktorAlle : doktorAlle.slice(0, DOKTOR_PLUS_ANTAL);

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

  // Fælles udseende for de sammenklappelige værktøjs-paneler (ejer 22/8:
  // "rodet, svært at nå sine annoncer" — annoncerne øverst, værktøjerne
  // foldet sammen; kun Salgsplanen står åben)
  const summaryKlasse =
    "flex min-h-touch cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden";
  const pilKlasse = "h-4 w-4 shrink-0 transition-transform group-open:rotate-180";
  const Pil = ({ lys = false }: { lys?: boolean }) => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={`${pilKlasse} ${lys ? "text-kalk/60" : "text-tekst/50"}`}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.oversigt.titel}
      </h1>

      {/* Tom tilstand ØVERST (ejer-ordre 22/8): en ny bruger skal se
          vejen i gang med det samme — ikke efter abonnent-panelerne */}
      {items.length === 0 ? (
        <div className="mt-6 rounded-bloed bg-gran p-6 text-kalk">
          <p className="max-w-laesbar">{da.oversigt.tom}</p>
          <Link href="/nyt-item" className="knap-link knap-link-lys mt-6 px-5">
            {da.oversigt.foersteKnap}
          </Link>
        </div>
      ) : null}

      {manglerOnboarding ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-bloed border border-kant bg-flade p-4">
          <p className="max-w-laesbar text-tekst/80">{da.onboarding.bannerTekst}</p>
          <Link href="/onboarding" className="knap-link px-5">
            {da.onboarding.bannerKnap}
          </Link>
        </div>
      ) : null}

      {/* ANNONCERNE FØRST (ejer-ordre 22/8): det man kommer for — statistik
          og liste står øverst, værktøjerne er foldet sammen nedenunder */}
      {items.length > 0 ? (
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
      ) : null}

      {/* Teaser for ikke-abonnenter — under annoncerne, ikke i vejen */}
      {!erAbonnent ? (
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

      {/* Salgsværktøjer (abonnenter): sammenklappelige paneler, så oversigten
          ikke drukner — kun Smart Salgsplan står åben som standard */}
      {erAbonnent ? (
        <div className="mt-8 flex items-baseline justify-between gap-2">
          <h2 className="font-mono text-detalje font-bold uppercase tracking-wide text-tekst/60">
            {da.oversigt.vaerktoejTitel}
          </h2>
          <span className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
            {da.oversigt.salgplanStempel}
          </span>
        </div>
      ) : null}
      {erAbonnent ? (
        <p className="mt-1 text-detalje text-tekst/60">
          {da.oversigt.vaerktoejLead}
        </p>
      ) : null}

      {/* Smart Salgsplan (ejer-ordre 20/8): abonnent-fordelen — åben som
          standard, for det er de konkrete næste skridt */}
      {erAbonnent && salgplan.length > 0 ? (
        <details open className="group mt-4 rounded-bloed bg-gran text-kalk" aria-label={da.oversigt.salgplanTitel}>
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
              {da.oversigt.salgplanTitel}
            </p>
            <Pil lys />
          </summary>
          <div className="px-5 pb-5">
            <p className="max-w-laesbar text-detalje text-kalk/80">
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
          </div>
        </details>
      ) : null}

      {/* Annonce-doktor (22/8, ejer: "en meget bedre funktion"): sundhedstjek
          pr. annonce med score og konkrete råd — Plus ser de 3 der trænger
          mest, Pro ser alle. Lige efter salgsplanen: det er handlingslaget. */}
      {erAbonnent && doktor.length > 0 ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.doktor.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.doktor.titel}
            </p>
            <Pil />
          </summary>
          <div className="px-5 pb-5">
            <p className="max-w-laesbar text-detalje text-tekst/70">
              {da.oversigt.doktor.lead}
            </p>
            <ul className="mt-3 flex flex-col gap-4">
              {doktor.map((punkt) => (
                <li key={punkt.itemId} className="border-b border-kant pb-3 text-detalje">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{punkt.titel}</span>
                    <span
                      className={`font-mono font-bold ${
                        punkt.score >= 80
                          ? "text-gran"
                          : punkt.score >= 50
                            ? "text-ravDyb"
                            : "text-fejl"
                      }`}
                    >
                      {da.oversigt.doktor.score(punkt.score)}
                    </span>
                  </div>
                  {punkt.raad.length > 0 ? (
                    <ul className="mt-1.5 flex flex-col gap-1 text-tekst/80">
                      {punkt.raad.map((raad) => (
                        <li key={raad} className="flex gap-2">
                          <span aria-hidden="true" className="text-tekst/40">
                            —
                          </span>
                          {raad}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-tekst/70">{da.oversigt.doktor.altOk}</p>
                  )}
                </li>
              ))}
            </ul>
            {tier !== "pro" && doktorAlle.length > doktor.length ? (
              <p className="mt-3 text-detalje text-tekst/60">
                {da.oversigt.doktor.plusNote}
              </p>
            ) : null}
            <p className="mt-3 text-detalje text-tekst/60">
              {da.oversigt.doktor.note}
            </p>
          </div>
        </details>
      ) : null}

      {/* Garderobe-radar (abonnent-fordel, 21/8): garderobens forventede
          værdi + hvad der er værd at source lige nu, vægtet med sæsonen */}
      {erAbonnent ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.radar.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.radar.titel}
            </p>
            <Pil />
          </summary>
          <div className="px-5 pb-5">
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
          <ul className="mt-2 grid gap-x-8 gap-y-1 md:grid-cols-2">
            {radar.map((punkt) => (
              <li
                key={`${punkt.maerke}-${punkt.kategori}`}
                className="flex items-baseline justify-between gap-4 border-b border-kant py-2.5 text-detalje"
              >
                <span className="min-w-0 flex-1">
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
          </div>
        </details>
      ) : null}

      {/* Flip-beregner (KUN Pro, 22/8): radarens storebror — hvad du højst
          må give i genbrug, og hvad gevinsten cirka bliver */}
      {flip.length > 0 ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.flip.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.flip.titel}
            </p>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
                {da.oversigt.flip.stempel}
              </span>
              <Pil />
            </span>
          </summary>
          <div className="px-5 pb-5">
          <p className="max-w-laesbar text-detalje text-tekst/70">
            {da.oversigt.flip.lead}
          </p>
          {/* To linjer pr. række (ejer 22/8: så det holder på en telefon):
              mærke + sæson øverst, køb/gevinst-tallene på egen mono-linje */}
          <ul className="mt-2 grid gap-x-8 gap-y-1 md:grid-cols-2">
            {flip.map((punkt) => (
              <li
                key={`${punkt.maerke}-${punkt.kategori}`}
                className="border-b border-kant py-2.5 text-detalje"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="font-medium">
                    {punkt.maerke} {punkt.kategori}
                  </span>
                  <span className={punkt.iSaeson ? "text-gran" : "text-tekst/60"}>
                    {punkt.saesonTekst}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-tekst/80">
                  {da.oversigt.flip.koebMaks(punkt.maksKoebDkk)} ·{" "}
                  {da.oversigt.flip.gevinst(punkt.gevinstDkk)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-detalje text-tekst/60">
            {da.oversigt.flip.note}
          </p>
          </div>
        </details>
      ) : null}

      {/* Sæson-kalender (alle abonnenter, 21/8): garderobens 12 måneder */}
      {erAbonnent && kalender.length > 0 ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.kalender.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.kalender.titel}
            </p>
            <Pil />
          </summary>
          <div className="px-5 pb-5">
          <p className="max-w-laesbar text-detalje text-tekst/70">
            {da.oversigt.kalender.lead}
          </p>
          <ul className="mt-3 grid gap-x-8 gap-y-1 md:grid-cols-2">
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
          </div>
        </details>
      ) : null}

      {/* Pris-trappe (alle abonnenter, 22/8): hvornår sætter du ned, og til
          hvad? Konkrete trin pr. annonce — det aktuelle trin er fremhævet */}
      {erAbonnent && trapper.length > 0 ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.pristrappe.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.pristrappe.titel}
            </p>
            <Pil />
          </summary>
          <div className="px-5 pb-5">
          <p className="max-w-laesbar text-detalje text-tekst/70">
            {da.oversigt.pristrappe.lead}
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {trapper.map((punkt) => (
              <li key={punkt.itemId} className="border-b border-kant pb-3 text-detalje">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{punkt.titel}</span>
                  {punkt.dagePaaTrappen != null ? (
                    <span className="text-tekst/60">
                      {da.oversigt.pristrappe.liggetid(punkt.dagePaaTrappen)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-tekst/80">
                  {punkt.trin.map((trin, i) => (
                    <span key={trin.fraDag}>
                      {i > 0 ? " → " : ""}
                      <span
                        className={
                          i === punkt.aktueltTrin ? "font-bold text-gran" : undefined
                        }
                      >
                        {trin.prisDkk} kr. ({da.oversigt.pristrappe.trinFra(trin.fraDag)}
                        {i === punkt.aktueltTrin
                          ? ` · ${da.oversigt.pristrappe.trinNu}`
                          : ""}
                        )
                      </span>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-detalje text-tekst/60">
            {da.oversigt.pristrappe.note}
          </p>
          </div>
        </details>
      ) : null}

      {/* Bundle-bygger (KUN Pro, 21/8 nat): pak 2-4 annoncer til én pakke */}
      {erAbonnent && tier === "pro" ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.bundleBygger.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.bundleBygger.titel}
            </p>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
                {da.bundleBygger.stempel}
              </span>
              <Pil />
            </span>
          </summary>
          <div className="px-5 pb-5">
          <p className="max-w-laesbar text-detalje text-tekst/70">
            {da.bundleBygger.forklaring}
          </p>
          <BundleBygger
            items={planInput
              .filter((i) => i.status === "active")
              .map((i) => ({ id: i.id, titel: i.titel, prisTilDkk: i.prisTilDkk }))}
          />
          </div>
        </details>
      ) : null}

      {/* Konkurrent-tjek (KUN Pro, 21/8): din pris mod markedets kvartiler */}
      {konkurrent.length > 0 ? (
        <details
          className="group mt-4 rounded-bloed border border-kant bg-flade"
          aria-label={da.oversigt.konkurrent.titel}
        >
          <summary className={summaryKlasse}>
            <p className="font-mono text-detalje font-bold tracking-wide text-gran">
              {da.oversigt.konkurrent.titel}
            </p>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-detalje uppercase tracking-wide text-tekst/50">
                {da.oversigt.konkurrent.stempel}
              </span>
              <Pil />
            </span>
          </summary>
          <div className="px-5 pb-5">
          <ul className="mt-1 flex flex-col gap-3">
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
          </div>
        </details>
      ) : null}

      {/* Suppliers-kortet nederst (ejer 22/8-oprydningen: annoncerne øverst,
          kommer snart-kortet skal ikke stå i vejen) */}
      <SupplierKommerSnartKort />
    </main>
  );
}
