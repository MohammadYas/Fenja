import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { misbrugsvaern } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";

export const metadata = { title: `${da.admin.titel} · ${da.site.navn}` };

// Admin-omkostningsside (G-1) — kun for ejeren (ADMIN_EMAIL). Alle andre får 404.
export default async function Admin() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user?.email !== adminEmail) notFound();

  const service = opretServiceKlient();
  const syvDageSiden = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await service
    .from("generations")
    .select("kind, status, cost_dkk, created_at, items(user_id)")
    .gte("created_at", syvDageSiden)
    .order("created_at", { ascending: false });

  type Raekke = {
    kind: string;
    status: string;
    cost_dkk: number | null;
    created_at: string;
    items: { user_id: string } | null;
  };
  const raekker = (data ?? []) as unknown as Raekke[];

  const prDag = new Map<string, number>();
  const prBruger = new Map<string, number>();
  for (const raekke of raekker) {
    const dag = raekke.created_at.slice(0, 10);
    const cost = Number(raekke.cost_dkk ?? 0);
    prDag.set(dag, (prDag.get(dag) ?? 0) + cost);
    const bruger = raekke.items?.user_id ?? "ukendt";
    prBruger.set(bruger, (prBruger.get(bruger) ?? 0) + cost);
  }

  const iDag = new Date().toISOString().slice(0, 10);
  const dagensForbrug = prDag.get(iDag) ?? 0;
  const loft = misbrugsvaern.dagligtBudgetloftDkk;

  return (
    <main className="py-6">
      <h1 className="font-display text-display">{da.admin.titel}</h1>

      <Card className="mt-6">
        <p className="text-detalje text-tekst/70">{da.admin.dagensForbrug}</p>
        <p className="mt-1 font-mono text-titel">
          {dagensForbrug.toFixed(2)} / {loft} kr.
        </p>
        {dagensForbrug >= loft ? (
          <p className="mt-1 text-detalje text-fejl">{da.admin.loftNaaet}</p>
        ) : null}
      </Card>

      <h2 className="mt-8 text-titel font-medium">{da.admin.prDag}</h2>
      <ul className="mt-2 flex flex-col gap-1 font-mono text-detalje">
        {[...prDag.entries()].map(([dag, cost]) => (
          <li key={dag}>
            {dag} · {cost.toFixed(2)} kr.
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-titel font-medium">{da.admin.prBruger}</h2>
      <ul className="mt-2 flex flex-col gap-1 font-mono text-detalje">
        {[...prBruger.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([bruger, cost]) => (
            <li key={bruger} className="truncate">
              {cost.toFixed(2)} kr. · {bruger}
            </li>
          ))}
      </ul>

      <h2 className="mt-8 text-titel font-medium">{da.admin.senesteGenereringer}</h2>
      <ul className="mt-2 flex flex-col gap-1 font-mono text-detalje">
        {raekker.slice(0, 30).map((raekke, i) => (
          <li key={i}>
            {raekke.created_at.slice(5, 16).replace("T", " ")} · {raekke.kind} ·{" "}
            {raekke.status} · {Number(raekke.cost_dkk ?? 0).toFixed(2)} kr.
          </li>
        ))}
      </ul>
    </main>
  );
}
