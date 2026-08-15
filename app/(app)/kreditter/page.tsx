import { Prislap } from "@/components/ui/prislap";
import { kreditter } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { KoebKnap } from "./koeb-knap";

export const metadata = { title: `${da.kreditter.titel} · ${da.site.navn}` };

// Kreditside (E-1/E-2): saldo, pakker, køb via Stripe Checkout.
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

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold uppercase">
        {da.kreditter.titel}
      </h1>
      <p className="mt-3 max-w-laesbar text-tekst/80">{da.kreditter.forklaring}</p>
      <p className="mt-2 font-mono">{da.kreditter.saldoNu(saldo)}</p>

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

      {/* Kreditpakker som prislapper — tøjets eget motiv (REDESIGN §2.3/§3.5) */}
      <div className="mt-10 flex flex-col gap-6">
        {kreditter.pakker.map((pakke, i) => (
          <Prislap
            key={pakke.id}
            rotation={i % 2 === 0 ? "venstre" : "hoejre"}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-mono text-titel font-bold">
                {da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)}
              </p>
              <p className="mt-1 font-mono text-detalje text-tekst/70">
                {da.kreditter.prisPrStk((pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","))}
              </p>
            </div>
            <KoebKnap pakkeId={pakke.id} />
          </Prislap>
        ))}
      </div>

      <p className="mt-4 text-detalje text-tekst/70">{da.kreditter.kvittering}</p>
    </main>
  );
}
