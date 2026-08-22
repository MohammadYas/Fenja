import { Card } from "@/components/ui/card";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { AbonnementValg } from "@/components/abonnement-valg";
import { KoebKnap } from "./koeb-knap";
import { PortalKnap } from "./portal-knap";

export const metadata = { title: `${da.kreditter.titel} · ${da.site.navn}` };

// Ejer-ordre 20/8: saldoen skal være FRISK hver gang — ingen cachet side
export const dynamic = "force-dynamic";

const formaterDato = (dato: Date): string =>
  dato.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

// Kreditside (E-2, pricing v3.0): abonnementet er standardvejen og fører
// siden; top-up vises KUN når man er løbet tør. Pakkerne er TILBAGE som
// engangskøb for alle (ejer-ordre 21/8: lav indgang, "skal have omsætning").
// Administration (kort/fakturaer/opsigelse) via Stripes kundeportal.
export default async function Kreditter({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: saldoRaekke } = await supabase
    .from("credit_balances")
    .select("balance")
    .eq("user_id", user!.id)
    .maybeSingle();
  const saldo = (saldoRaekke?.balance as number | undefined) ?? 0;

  // Tidligste udløb — vises kun når der faktisk er noget, der udløber.
  // I demo-tilstand (uden rigtig Supabase) svarer rpc'en tomt, og linjen udelades.
  const { data: statusData } = await supabase.rpc("beregn_kredit_status", {
    p_user_id: user!.id,
  });
  const statusRaekke = (Array.isArray(statusData) ? statusData[0] : statusData) as
    | { naeste_udloeb: string | null; naeste_udloeb_antal: number }
    | null
    | undefined;
  const naesteUdloeb = statusRaekke?.naeste_udloeb
    ? {
        dato: new Date(statusRaekke.naeste_udloeb),
        antal: Number(statusRaekke.naeste_udloeb_antal),
      }
    : null;

  // Ejer-ordre 2026-08-20: top-up er KUN for abonnenter (og kun ved lav saldo)
  const { harAktivtAbonnement } = await import("@/lib/betaling/abonnement");
  const erAbonnent = user?.email ? await harAktivtAbonnement(user.email) : false;
  // Ejer-ordre 22/8: abonnement KRÆVES for kreditter — pakkerne er top-up
  // for abonnenter, ikke en indgang udenom. "Snart tør" tæller også, så man
  // ikke først opdager problemet midt i en annonce.
  const erSnartToem = saldo <= kreditter.snartToemUnder;
  const visTopUp = erAbonnent;

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.kreditter.titel}
      </h1>

      {/* Løbet tør? Genvej direkte til top-up (ejer-ordre 22/8) — vises
          kun for abonnenter, for kun de kan købe ekstra kreditter */}
      {erAbonnent ? (
        <a
          href="#fyld-op"
          className={`mt-4 flex min-h-touch items-center justify-between gap-4 rounded-bloed px-4 py-3 transition ${
            erSnartToem
              ? "bg-gran text-kalk hover:bg-koks"
              : "border border-kant bg-flade hover:border-koks"
          }`}
        >
          <span className="max-w-laesbar">
            {erSnartToem
              ? da.kreditter.topUp.bannerToem(saldo)
              : da.kreditter.topUp.bannerNormal}
          </span>
          <span aria-hidden="true" className="shrink-0 font-mono">
            ↓
          </span>
        </a>
      ) : null}

      {/* Succes-tilstand som gran-blok (REDESIGN §2.2) */}
      {status === "succes" ? (
        <p role="status" className="mt-4 max-w-laesbar rounded-bloed bg-gran p-4 text-kalk">
          {da.kreditter.koebSucces}
        </p>
      ) : null}
      {status === "afbrudt" ? (
        <p role="status" className="mt-4 max-w-laesbar rounded-bloed border border-kant bg-flade p-3">
          {da.kreditter.koebAfbrudt}
        </p>
      ) : null}

      {/* Top-up-kortet står øverst, når saldoen er ved at være brugt */}
      {erAbonnent && erSnartToem ? (
        <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 border-gran">
          <div className="min-w-0">
            <p className="font-display text-titel font-bold">{da.kreditter.topUp.titel}</p>
            <p className="mt-1 font-mono font-bold">
              {da.kreditter.topUp.linje(kreditter.topUp.antal, kreditter.topUp.prisDkk)}
            </p>
            <p className="mt-1 text-detalje text-tekst/70">
              {da.kreditter.topUp.forklaring}
            </p>
          </div>
          <KoebKnap pakkeId={kreditter.topUp.id} />
        </Card>
      ) : null}

      {/* Abonnementet — standardvejen (køb md./år via Stripe Checkout) */}
      <section className={visTopUp ? "mt-8" : "mt-10"} aria-label={da.kreditter.abonnementTitel}>
        <h2 className="font-display text-display font-bold">
          {da.kreditter.abonnementTitel}
        </h2>
        <p className="mt-2 max-w-laesbar text-tekst/80">
          {da.kreditter.abonnementForklaring}
        </p>
        <AbonnementValg koebAktiv tone="lys" className="mt-6" />
        <PortalKnap className="mt-6" />
      </section>

      {/* Ekstra kreditter (ejer-ordre 22/8): KUN for abonnenter — pakkerne
          er top-up, ikke en vej udenom abonnementet. Rækker i stedet for
          kort: navn og pris på samme linje, knap i egen kolonne, så det
          holder på en telefon. */}
      {erAbonnent ? (
        <section id="fyld-op" className="mt-10 scroll-mt-6" aria-label={da.kreditter.pakkeTitel}>
          <h2 className="font-display text-titel font-bold">
            {da.kreditter.pakkeTitel}
          </h2>
          <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
            {da.kreditter.pakkeForklaring}
          </p>
          <ul className="mt-4 border-t border-kant">
            {kreditter.pakker.map((pakke) => (
              <li
                key={pakke.id}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-kant py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold">
                    {da.kreditter.pakkeNavne[pakke.id] ?? pakke.id}
                    {pakke.id === kreditter.anbefaletPakkeId ? (
                      <span className="ml-2 font-mono text-detalje font-normal uppercase tracking-wide text-gran">
                        {da.kreditter.anbefalet}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 font-mono text-detalje text-tekst/70">
                    {da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)} ·{" "}
                    {da.kreditter.prisPrStk(
                      (pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","),
                    )}
                  </p>
                </div>
                <KoebKnap pakkeId={pakke.id} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Saldo og forklaring — under abonnementet (ejer-ordre 20/8:
          abonnementerne skal øverst; købsvejen før regnskabet) */}
      <section className="mt-10 border-t border-kant pt-6" aria-label={da.kreditter.titel}>
        <p className="max-w-laesbar text-tekst/80">{da.kreditter.forklaring}</p>
        <p className="mt-2 font-mono">{da.kreditter.saldoNu(saldo)}</p>
        {/* Ejer-ordre 22/8: kreditter forsvinder ALDRIG ved opsigelse — de
            bruges færdige. Sig det tydeligt til den, der ikke abonnerer nu,
            men stadig har saldo tilbage. */}
        {!erAbonnent && saldo > 0 ? (
          <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
            {da.kreditter.beholderVedOpsigelse}
          </p>
        ) : null}
        {naesteUdloeb && naesteUdloeb.antal > 0 ? (
          <p className="mt-1 text-detalje text-tekst/70">
            {da.kreditter.udloebNaeste(naesteUdloeb.antal, formaterDato(naesteUdloeb.dato))}
          </p>
        ) : null}
      </section>

      <p className="mt-8 text-detalje text-tekst/70">{da.kreditter.udloebNote}</p>
      <p className="mt-1 text-detalje text-tekst/70">{da.kreditter.kvittering}</p>
    </main>
  );
}
