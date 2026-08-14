import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { MarkerSolgt } from "./marker-solgt";

export const metadata = { title: `${da.oversigt.titel} · ${da.site.navn}` };

type ItemRaekke = {
  id: string;
  brand: string | null;
  titel: string | null;
  category: string | null;
  status: "draft" | "active" | "sold";
  sold_price_dkk: number | null;
  leveret_at: string | null;
  solgt_at: string | null;
  created_at: string;
};

// Item-bibliotek (B-7) + statistik (B-10): salgsværdi, antal, liggetid.
export default async function Oversigt() {
  const supabase = await opretServerKlient();
  const { data } = await supabase
    .from("items")
    .select(
      "id, brand, titel, category, status, sold_price_dkk, leveret_at, solgt_at, created_at",
    )
    .order("created_at", { ascending: false });
  const items = (data ?? []) as ItemRaekke[];

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

  if (items.length === 0) {
    return (
      <main className="py-6">
        <h1 className="font-display text-display">{da.oversigt.titel}</h1>
        <p className="mt-4 max-w-laesbar text-tekst/80">{da.oversigt.tom}</p>
        <Link
          href="/nyt-item"
          className="mt-6 inline-flex min-h-touch items-center rounded-bloed bg-primaer px-5 font-medium text-primaer-tekst"
        >
          {da.oversigt.foersteKnap}
        </Link>
      </main>
    );
  }

  return (
    <main className="py-6">
      <h1 className="font-display text-display">{da.oversigt.titel}</h1>

      {solgte.length > 0 ? (
        <Card className="mt-6" aria-label={da.oversigt.statistikTitel}>
          <p className="font-mono text-titel text-pris">
            {da.oversigt.samletVaerdi(samletVaerdi)}
          </p>
          <p className="mt-1 text-detalje text-tekst/70">
            {da.oversigt.solgteAntal(solgte.length)}
            {snitLiggetid != null ? ` · ${da.oversigt.liggetid(snitLiggetid)}` : null}
          </p>
        </Card>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/items/${item.id}`}
                  className="min-w-0 flex-1 font-medium underline-offset-4 hover:underline"
                >
                  <span className="block truncate">
                    {item.titel ?? `${item.brand ?? ""} ${item.category ?? ""}`.trim()}
                  </span>
                </Link>
                <Badge variant={item.status === "sold" ? "status" : "neutral"}>
                  {da.oversigt.status[item.status]}
                </Badge>
              </div>
              {item.status === "sold" && item.sold_price_dkk != null ? (
                <p className="font-mono text-detalje text-pris">
                  {item.sold_price_dkk} kr.
                </p>
              ) : null}
              {item.status === "active" ? <MarkerSolgt itemId={item.id} /> : null}
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}
