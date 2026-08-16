import { Card } from "@/components/ui/card";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { KoebKnap } from "./koeb-knap";

export const metadata = { title: `${da.kreditter.titel} · ${da.site.navn}` };

const formaterDato = (dato: Date): string =>
  dato.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

// Kreditside (E-2, pricing v3.0): saldo, ærlig udløbsvisning, top-up ved lav
// saldo og pakker — køb via Stripe Checkout.
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

  const visTopUp = saldo <= kreditter.topUpVedSaldoHoejst;

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.kreditter.titel}
      </h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{da.kreditter.forklaring}</p>
      <p className="mt-2 font-mono">{da.kreditter.saldoNu(saldo)}</p>
      {naesteUdloeb && naesteUdloeb.antal > 0 ? (
        <p className="mt-1 text-detalje text-tekst/70">
          {da.kreditter.udloebNaeste(naesteUdloeb.antal, formaterDato(naesteUdloeb.dato))}
        </p>
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

      {/* Top-up ved lav saldo (pricing v3.0): ét klik, konkret linje, intet pres */}
      {visTopUp ? (
        <Card className="mt-10 flex items-center justify-between gap-4 border-gran">
          <div>
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

      {/* Kreditpakker som rolige hør-kort */}
      <div className={`${visTopUp ? "mt-4" : "mt-10"} flex flex-col gap-4`}>
        {kreditter.pakker.map((pakke) => (
          <Card key={pakke.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-detalje font-bold">
                {da.kreditter.pakkeNavne[pakke.id]}
                {pakke.id === kreditter.anbefaletPakkeId ? (
                  <span className="ml-2 font-mono font-normal text-gran">
                    {da.kreditter.anbefalet}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 font-mono text-titel font-bold">
                {da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)}
              </p>
              <p className="mt-1 font-mono text-detalje text-tekst/70">
                {da.kreditter.prisPrStk((pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","))}
              </p>
            </div>
            <KoebKnap pakkeId={pakke.id} />
          </Card>
        ))}
      </div>

      <p className="mt-4 text-detalje text-tekst/70">{da.kreditter.udloebNote}</p>
      <p className="mt-1 text-detalje text-tekst/70">{da.kreditter.kvittering}</p>
    </main>
  );
}
