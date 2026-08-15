import { Card } from "@/components/ui/card";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { SletKonto } from "./slet-konto";

export const metadata = { title: `${da.konto.titel} · ${da.site.navn}` };

// Konto-side (A-3): e-mail, saldo, købshistorik, slet konto.
export default async function Konto() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: saldoRaekke }, { data: koeb }] = await Promise.all([
    supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("credit_ledger")
      .select("delta, ts")
      .eq("user_id", user!.id)
      .eq("reason", "purchase")
      .order("ts", { ascending: false }),
  ]);

  const saldo = (saldoRaekke?.balance as number | undefined) ?? 0;

  return (
    <main className="py-6">
      <h1 className="font-display text-kaempe font-bold">
        {da.konto.titel}
      </h1>

      <Card className="mt-6">
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
              {da.konto.emailLabel}
            </dt>
            <dd className="break-words">{user!.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
              {da.konto.saldoLabel}
            </dt>
            <dd className="font-mono text-hero font-bold text-pris">
              {da.nav.saldo(saldo)}
            </dd>
          </div>
        </dl>
      </Card>

      <h2 className="mt-8 text-titel font-medium">{da.konto.koebshistorik}</h2>
      {koeb && koeb.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {koeb.map((k: { delta: unknown; ts: unknown }, i: number) => (
            <li key={i} className="font-mono text-detalje">
              {da.konto.koebLinje(
                k.delta as number,
                new Date(k.ts as string).toLocaleDateString("da-DK"),
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 max-w-laesbar text-tekst/80">{da.konto.ingenKoeb}</p>
      )}

      <div className="soem-vandret mt-10" aria-hidden="true" />
      <SletKonto />
    </main>
  );
}
