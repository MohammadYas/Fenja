import { FeedbackForm } from "@/components/feedback-form";
import { Card } from "@/components/ui/card";
import { da } from "@/lib/copy/da";
import { HJEM, hentHjem, vaelgHjem } from "@/lib/pipeline/skabeloner";
import { opretServerKlient } from "@/lib/supabase/server";
import { HjemVaelger } from "./hjem-vaelger";
import { KoenVaelger } from "./koen-vaelger";
import { LogUdKnap } from "./log-ud-knap";
import { SletKonto } from "./slet-konto";

export const metadata = { title: `${da.konto.titel} · ${da.site.navn}` };

// Konto-side (A-3): e-mail, saldo, købshistorik, slet konto.
export default async function Konto() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: saldoRaekke }, { data: koeb }, { data: profil }] =
    await Promise.all([
      supabase
        .from("credit_balances")
        .select("balance")
        .eq("user_id", user!.id)
        .maybeSingle(),
      // Både engangskøb og abonnementskvoter — abonnement er standardvejen
      // (ejer-ordre 2026-08-16), og en abonnent skal kunne se sin historik
      supabase
        .from("credit_ledger")
        .select("delta, ts, reason")
        .eq("user_id", user!.id)
        .in("reason", ["purchase", "subscription"])
        .order("ts", { ascending: false }),
      supabase
        .from("profiles")
        .select("home_anchor, koen, haar_farve")
        .eq("id", user!.id)
        .maybeSingle(),
    ]);

  const saldo = (saldoRaekke?.balance as number | undefined) ?? 0;

  // S31 · effektivt hjem: et gyldigt selvvalg vises som det; ellers det
  // deterministiske. Navnene kommer fra da.ts (NFR-12).
  const hjemAnker = (profil?.home_anchor as string | null | undefined) ?? null;
  const effektivtHjem = hentHjem(hjemAnker) ?? vaelgHjem(user!.id);
  const effektivtHjemNavn =
    da.konto.hjem.navne[effektivtHjem.id] ?? effektivtHjem.navn;

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
        {/* Ejer-ordre 2026-08-20: log ud skal være nemt at finde på Konto */}
        <div className="mt-4 border-t border-kant pt-4">
          <LogUdKnap />
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-titel font-medium">{da.konto.koen.titel}</h2>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
          {da.konto.koen.forklaring}
        </p>
        <KoenVaelger
          koen={(profil?.koen as string | null | undefined) ?? null}
          haarFarve={(profil?.haar_farve as string | null | undefined) ?? null}
        />
      </Card>

      <Card className="mt-6">
        <h2 className="text-titel font-medium">{da.konto.hjem.titel}</h2>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
          {da.konto.hjem.forklaring}
        </p>
        <p className="mt-3 font-mono text-detalje uppercase tracking-wide text-tekst/70">
          {da.konto.hjem.nuvaerende(effektivtHjemNavn)}
        </p>
        <HjemVaelger valgt={hjemAnker} hjemIder={HJEM.map((h) => h.id)} />
      </Card>

      <h2 className="mt-8 text-titel font-medium">{da.konto.koebshistorik}</h2>
      {koeb && koeb.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {koeb.map((k: { delta: unknown; ts: unknown; reason: unknown }, i: number) => {
            const linje =
              k.reason === "subscription"
                ? da.konto.abonnementLinje
                : da.konto.koebLinje;
            return (
              <li key={i} className="font-mono text-detalje">
                {linje(
                  Number(k.delta),
                  new Date(k.ts as string).toLocaleDateString("da-DK"),
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 max-w-laesbar text-tekst/80">{da.konto.ingenKoeb}</p>
      )}

      {/* Feedback (ejer-ordre 21/8): ris, ros og idéer — læses i admin */}
      <Card className="mt-8">
        <h2 className="text-titel font-medium">{da.feedback.titel}</h2>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
          {da.feedback.forklaring}
        </p>
        <div className="mt-4">
          <FeedbackForm />
        </div>
      </Card>

      {/* Indsigt + dataportabilitet (GDPR art. 15/20) — selvbetjent, ingen mail nødvendig */}
      <Card className="mt-8">
        <h2 className="text-titel font-medium">{da.konto.data.titel}</h2>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
          {da.konto.data.forklaring}
        </p>
        <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
          {da.konto.data.billedlinkNote}
        </p>
        <a
          href="/api/konto/eksport"
          download
          className="knap-link mt-4"
        >
          {da.konto.data.hent}
        </a>
      </Card>

      <div className="soem-vandret mt-10" aria-hidden="true" />
      <SletKonto />
    </main>
  );
}
