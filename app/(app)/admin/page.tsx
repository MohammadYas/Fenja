import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { misbrugsvaern } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";
import { KlageListe, type KlageRaekke } from "./klage-liste";

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

  // Åbne klager (ejer-ordrer 2026-08-20) — service-rollen ser alle, og admin
  // får ALT relevant: genererede billeder, brugerens fotos og itemets felter,
  // så afgørelsen kan træffes direkte i listen
  const { data: klageData } = await service
    .from("klager")
    .select(
      "id, begrundelse, oprettet_at, items(titel, brand, size, condition, category, color, label_text, defects_text, item_photos(role, original_url, cleaned_url), generations(kind, status, output_url, created_at))",
    )
    .eq("status", "aaben")
    .order("oprettet_at", { ascending: true });

  const signer = async (sti: string | null): Promise<string | null> => {
    if (!sti) return null;
    if (sti.startsWith("http")) return sti;
    const { data } = await service.storage
      .from("item-photos")
      .createSignedUrl(sti, 3600);
    return data?.signedUrl ?? null;
  };

  type KlageRaa = {
    id: string;
    begrundelse: string;
    oprettet_at: string;
    items: {
      titel: string | null;
      brand: string | null;
      size: string | null;
      condition: string | null;
      category: string | null;
      color: string | null;
      label_text: string | null;
      defects_text: string | null;
      item_photos: { role: string; original_url: string; cleaned_url: string | null }[];
      generations: {
        kind: string;
        status: string;
        output_url: string | null;
        created_at: string;
      }[];
    } | null;
  };

  const klager: KlageRaekke[] = await Promise.all(
    ((klageData ?? []) as unknown as KlageRaa[]).map(async (k) => {
      const item = k.items;
      const genererede = (
        await Promise.all(
          (item?.generations ?? [])
            .filter((g) => g.kind === "onmodel" && g.status === "succeeded" && g.output_url)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((g) => signer(g.output_url)),
        )
      ).filter((url): url is string => url !== null);
      const brugerFotos = (
        await Promise.all(
          (item?.item_photos ?? []).map((f) => signer(f.cleaned_url ?? f.original_url)),
        )
      ).filter((url): url is string => url !== null);
      return {
        id: k.id,
        begrundelse: k.begrundelse,
        oprettet_at: k.oprettet_at,
        item_titel: item?.titel ?? null,
        detaljer: [
          item?.brand,
          item?.category,
          item?.size,
          item?.condition,
          item?.color,
          item?.label_text,
        ]
          .filter(Boolean)
          .join(" · "),
        fejl_beskrivelse: item?.defects_text ?? null,
        genererede,
        bruger_fotos: brugerFotos,
      };
    }),
  );

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

      {/* Klager (ejer-ordre 2026-08-20): åbne anmodninger om kredit retur */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.klagerTitel}</h2>
      <KlageListe klager={klager} />
    </main>
  );
}
