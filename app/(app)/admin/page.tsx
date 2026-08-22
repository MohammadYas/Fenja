import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CONTENT_PROMPTS } from "@/lib/admin/content-prompts";
import { erAdmin } from "@/lib/auth/admin";
import { misbrugsvaern } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";
import { ContentVaerktoejer } from "./content-vaerktoejer";
import { ForsideBilleder } from "./forside-billeder";
import { TildelKreditter } from "./tildel-kreditter";
import { KlageListe, type KlageRaekke } from "./klage-liste";

export const metadata = { title: `${da.admin.titel} · ${da.site.navn}` };

// Admin-side (G-1) — kun for admins (ADMIN_EMAIL, kommasepareret liste).
// Alle andre får 404.
export default async function Admin() {
  const supabase = await opretServerKlient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!erAdmin(user?.email)) notFound();

  const service = opretServiceKlient();
  const syvDageSiden = new Date(Date.now() - 7 * 86_400_000).toISOString();

  // Nøgletal (avanceret panel, ejer-ordre 21/8): brugere, annoncer, salg og
  // feedback — hurtige head-counts, ingen rækker hentes
  const [brugere, brugereNye, annoncerAktive, annoncerSolgte, solgteRaekker, feedbackData] =
    await Promise.all([
      service.from("profiles").select("id", { count: "exact", head: true }),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", syvDageSiden),
      service
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      service
        .from("items")
        .select("id", { count: "exact", head: true })
        .eq("status", "sold"),
      service.from("items").select("sold_price_dkk").eq("status", "sold"),
      service
        .from("feedback")
        // Ingen profiles-embed: feedback.user_id peger på auth.users, ikke
        // profiles, så PostgREST kan ikke joine — e-mails slås op bagefter
        .select("id, user_id, kategori, besked, status, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);
  // Trafik (21/8 nat, cookieløs): sidste 30 dage — pr. dag, top-sider,
  // kilder, UTM-kampagner og enheds-split. Fejler harmløst før migrationen.
  const trediveDageSiden = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: besoegData } = await service
    .from("besoeg")
    .select("sti, referrer_host, utm_source, utm_medium, utm_campaign, enhed, created_at")
    // /intern/* er rate-limit-tællere (forhandling/bundle), ikke trafik
    .not("sti", "like", "/intern%")
    .gte("created_at", trediveDageSiden)
    .order("created_at", { ascending: false })
    .limit(10_000);
  type BesoegRaekke = {
    sti: string;
    referrer_host: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    enhed: string;
    created_at: string;
  };
  const besoeg = (besoegData ?? []) as BesoegRaekke[];
  const talOp = (vaerdier: (string | null)[]): [string, number][] => {
    const m = new Map<string, number>();
    for (const v of vaerdier) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  };
  const besoegPrDag = talOp(besoeg.map((b) => b.created_at.slice(0, 10))).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  const topSider = talOp(besoeg.map((b) => b.sti));
  const topKilder = talOp(besoeg.map((b) => b.referrer_host));
  const topKampagner = talOp(
    besoeg.map((b) =>
      b.utm_source ? [b.utm_source, b.utm_medium, b.utm_campaign].filter(Boolean).join(" / ") : null,
    ),
  );
  const mobilAndel =
    besoeg.length > 0
      ? Math.round((besoeg.filter((b) => b.enhed === "mobil").length / besoeg.length) * 100)
      : null;

  // Kontakt-henvendelser (21/8 nat) — navn+email står i rækken selv
  const { data: henvendelserData } = await service
    .from("henvendelser")
    .select("id, navn, email, besked, status, created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  type Henvendelse = {
    id: string;
    navn: string;
    email: string;
    besked: string;
    status: string;
    created_at: string;
  };
  const henvendelser = (henvendelserData ?? []) as Henvendelse[];
  const solgtSum = ((solgteRaekker.data ?? []) as { sold_price_dkk: number | null }[]).reduce(
    (sum, r) => sum + Number(r.sold_price_dkk ?? 0),
    0,
  );
  type FeedbackRaekke = {
    id: string;
    user_id: string;
    kategori: string;
    besked: string;
    status: string;
    created_at: string;
    email?: string | null;
  };
  // Fejler harmløst før feedback-migrationen er kørt
  const feedbackRaa = (feedbackData.data ?? []) as unknown as FeedbackRaekke[];
  const feedbackBrugere = [...new Set(feedbackRaa.map((f) => f.user_id))];
  const { data: feedbackProfiler } = feedbackBrugere.length
    ? await service.from("profiles").select("id, email").in("id", feedbackBrugere)
    : { data: [] };
  const emailPrBruger = new Map(
    ((feedbackProfiler ?? []) as { id: string; email: string | null }[]).map((p) => [
      p.id,
      p.email,
    ]),
  );
  const feedback = feedbackRaa.map((f) => ({
    ...f,
    email: emailPrBruger.get(f.user_id) ?? null,
  }));

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

  // Kost pr. kredit (ejer-ordre 20/8): samlet API-omkostning delt med antal
  // leverede billeder — enheden der måles på er 1 kredit = 1 billede, og
  // rens + tekst er regnet med, så tallet er den ÆGTE produktionskost pr. kredit.
  const totalCost = raekker.reduce((sum, r) => sum + Number(r.cost_dkk ?? 0), 0);
  const leveredeBilleder = raekker.filter(
    (r) => r.kind === "onmodel" && r.status === "succeeded",
  ).length;
  const kostPrKredit = leveredeBilleder > 0 ? totalCost / leveredeBilleder : null;

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

      {/* Nøgletal (21/8): fire tal øverst — resten af panelet er detaljer */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            [da.admin.noegletal.brugere, `${brugere.count ?? 0}`, da.admin.noegletal.nyeSyvDage(brugereNye.count ?? 0)],
            [da.admin.noegletal.aktiveAnnoncer, `${annoncerAktive.count ?? 0}`, null],
            [da.admin.noegletal.solgte, `${annoncerSolgte.count ?? 0}`, null],
            [da.admin.noegletal.solgtFor, `${solgtSum.toFixed(0)} kr.`, null],
          ] as const
        ).map(([titel, vaerdi, note]) => (
          <Card key={titel}>
            <p className="text-detalje text-tekst/70">{titel}</p>
            <p className="mt-1 font-mono text-titel">{vaerdi}</p>
            {note ? <p className="mt-1 text-detalje text-tekst/70">{note}</p> : null}
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <p className="text-detalje text-tekst/70">{da.admin.dagensForbrug}</p>
        <p className="mt-1 font-mono text-titel">
          {dagensForbrug.toFixed(2)} / {loft} kr.
        </p>
        {dagensForbrug >= loft ? (
          <p className="mt-1 text-detalje text-fejl">{da.admin.loftNaaet}</p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <p className="text-detalje text-tekst/70">{da.admin.kostPrKredit}</p>
        <p className="mt-1 font-mono text-titel">
          {kostPrKredit != null ? `${kostPrKredit.toFixed(2)} kr.` : "—"}
        </p>
        <p className="mt-1 text-detalje text-tekst/70">
          {da.admin.kostPrKreditForklaring}
        </p>
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

      {/* Trafik (21/8 nat): cookieløs statistik — sider, kilder, UTM, enhed */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.trafik.titel}</h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.trafik.forklaring}
        {mobilAndel != null ? ` ${da.admin.trafik.mobilAndel(mobilAndel)}` : ""}
      </p>
      {besoeg.length === 0 ? (
        <p className="mt-2 text-detalje text-tekst/70">{da.admin.trafik.tom}</p>
      ) : (
        <div className="mt-3 grid gap-6 sm:grid-cols-2">
          {(
            [
              [da.admin.trafik.prDag, besoegPrDag],
              [da.admin.trafik.topSider, topSider],
              [da.admin.trafik.topKilder, topKilder],
              [da.admin.trafik.topKampagner, topKampagner],
            ] as const
          ).map(([titel, raekker]) => (
            <div key={titel}>
              <p className="font-medium">{titel}</p>
              {raekker.length === 0 ? (
                <p className="mt-1 text-detalje text-tekst/60">—</p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1 font-mono text-detalje">
                  {raekker.map(([navn, antal]) => (
                    <li key={navn} className="flex justify-between gap-4">
                      <span className="truncate">{navn}</span>
                      <span className="shrink-0">{antal}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tildel kreditter (22/8): support, kompensation, kampagner */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.tildel.titel}</h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.tildel.forklaring}
      </p>
      <TildelKreditter />

      {/* Forside-billeder (21/8 nat): upload uden deploy */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.forsideBilleder.titel}</h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.forsideBilleder.forklaring}
      </p>
      <ForsideBilleder />

      {/* Content-værktøjer (21/8): prompts til Claude/ChatGPT + delebilleder */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.content.titel}</h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.content.forklaring}
      </p>
      <ContentVaerktoejer prompts={CONTENT_PROMPTS} />

      {/* Kontakt-henvendelser (21/8 nat): seneste 30, nyeste øverst */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.henvendelserTitel}</h2>
      {henvendelser.length === 0 ? (
        <p className="mt-2 text-detalje text-tekst/70">{da.admin.henvendelserTom}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {henvendelser.map((h) => (
            <li key={h.id}>
              <Card>
                <p className="font-mono text-detalje text-tekst/70">
                  {new Date(h.created_at).toLocaleString("da-DK")} · {h.navn} ·{" "}
                  <a className="underline" href={`mailto:${h.email}`}>
                    {h.email}
                  </a>
                </p>
                <p className="mt-2 max-w-laesbar whitespace-pre-wrap">{h.besked}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Feedback (21/8): seneste 30, nyeste øverst */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.feedbackTitel}</h2>
      {feedback.length === 0 ? (
        <p className="mt-2 text-detalje text-tekst/70">{da.admin.feedbackTom}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {feedback.map((f) => (
            <li key={f.id}>
              <Card>
                <p className="font-mono text-detalje text-tekst/70">
                  {new Date(f.created_at).toLocaleString("da-DK")} ·{" "}
                  {da.feedback.kategorier[f.kategori] ?? f.kategori} ·{" "}
                  {f.email ?? "ukendt"}
                </p>
                <p className="mt-2 max-w-laesbar whitespace-pre-wrap">{f.besked}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
