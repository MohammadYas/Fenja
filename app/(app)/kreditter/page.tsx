import { Card } from "@/components/ui/card";
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
      <h1 className="font-display text-display">{da.kreditter.titel}</h1>
      <p className="mt-2 max-w-laesbar text-tekst/80">{da.kreditter.forklaring}</p>
      <p className="mt-2 font-mono">{da.kreditter.saldoNu(saldo)}</p>

      {status === "succes" ? (
        <p role="status" className="mt-4 max-w-laesbar rounded-bloed border border-gran bg-flade p-3">
          {da.kreditter.koebSucces}
        </p>
      ) : null}
      {status === "afbrudt" ? (
        <p role="status" className="mt-4 max-w-laesbar rounded-bloed border border-kant bg-flade p-3">
          {da.kreditter.koebAfbrudt}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4">
        {kreditter.pakker.map((pakke) => (
          <Card key={pakke.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {da.kreditter.pakkeLinje(pakke.antal, pakke.prisDkk)}
              </p>
              <p className="font-mono text-detalje text-tekst/70">
                {da.kreditter.prisPrStk((pakke.prisDkk / pakke.antal).toFixed(2).replace(".", ","))}
              </p>
            </div>
            <KoebKnap pakkeId={pakke.id} />
          </Card>
        ))}
      </div>

      <p className="mt-4 text-detalje text-tekst/70">{da.kreditter.kvittering}</p>
    </main>
  );
}
