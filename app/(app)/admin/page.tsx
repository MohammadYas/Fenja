import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { hentModelValg } from "@/lib/admin/billedmodel-valg";
import { CONTENT_PROMPTS } from "@/lib/admin/content-prompts";
import {
  STANDARD_TRIAL_INDSTILLINGER,
  hentTrialIndstillinger,
} from "@/lib/admin/trial-indstillinger";
import { erAdmin } from "@/lib/auth/admin";
import { billedModeller, misbrugsvaern } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { opretServerKlient } from "@/lib/supabase/server";
import { opretServiceKlient } from "@/lib/supabase/service";
import { BilledModelValg } from "./billedmodel";
import { ContentVaerktoejer } from "./content-vaerktoejer";
import { ForsideBilleder } from "./forside-billeder";
import { TildelKreditter } from "./tildel-kreditter";
import { TrialIndstillinger } from "./trial-indstillinger";
import { KlageListe, type KlageRaekke } from "./klage-liste";

export const metadata = { title: `${da.admin.titel} · ${da.site.navn}` };

// Admin-side (G-1) — kun for admins (ADMIN_EMAIL, kommasepareret liste).
// Alle andre får 404.
export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ dage?: string; kilde?: string }>;
}) {
  const filtre = await searchParams;
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
  // Trafik (21/8 nat, cookieløs — udvidet 22/8 med UNIKKE besøgende og
  // filtre til TikTok-lanceringen). Perioden og kilden styres af ?dage= og
  // ?kilde=, så tallene kan skæres uden at forlade siden.
  const PERIODER = [1, 7, 30] as const;
  const valgtDage = PERIODER.includes(Number(filtre.dage) as 1 | 7 | 30)
    ? (Number(filtre.dage) as 1 | 7 | 30)
    : 7;
  const valgtKilde = (filtre.kilde ?? "").trim().toLowerCase();
  const periodeStart = new Date(
    valgtDage === 1
      ? new Date().setHours(0, 0, 0, 0)
      : Date.now() - valgtDage * 86_400_000,
  ).toISOString();

  type BesoegRaekke = {
    sti: string;
    referrer_host: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    enhed: string;
    created_at: string;
    besoegende?: string | null;
  };

  // Besøgende-kolonnen kommer med migration 20260822180000 — er den ikke kørt
  // endnu, henter vi de gamle felter, og unik-tallet vises som ukendt.
  const besoegSelect =
    "sti, referrer_host, utm_source, utm_medium, utm_campaign, enhed, created_at";
  const besoegQuery = (felter: string) =>
    service
      .from("besoeg")
      .select(felter)
      // /intern/* er rate-limit-tællere (forhandling/bundle), ikke trafik
      .not("sti", "like", "/intern%")
      .gte("created_at", periodeStart)
      .order("created_at", { ascending: false })
      .limit(20_000);
  // Resten af sidens data hentes i ÉN parallel runde — før lå der seks
  // database-rundture i rækkefølge her, og oven på et koldstart blev siden
  // så langsom på mobil, at telefonen opgav (499 i Netlify-loggen 23/8).
  const [foersteForsoeg, modelValg, henvendelserSvar, feedbackProfilerSvar, generationsSvar, klageSvar] =
    await Promise.all([
      besoegQuery(`${besoegSelect}, besoegende`),
      hentModelValg(),
      service
        .from("henvendelser")
        .select("id, navn, email, besked, status, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
      // Feedback-afsendernes e-mails — bruger-id'erne kom i første runde
      (() => {
        const ids = [
          ...new Set(
            ((feedbackData.data ?? []) as { user_id: string }[]).map((f) => f.user_id),
          ),
        ];
        return ids.length
          ? service.from("profiles").select("id, email").in("id", ids)
          : Promise.resolve({ data: [] });
      })(),
      service
        .from("generations")
        .select("kind, status, cost_dkk, created_at, fejl, items(user_id)")
        .gte("created_at", syvDageSiden)
        .order("created_at", { ascending: false }),
      // Åbne klager (ejer-ordrer 2026-08-20): admin får ALT relevant, så
      // afgørelsen kan træffes direkte i listen
      service
        .from("klager")
        .select(
          "id, begrundelse, oprettet_at, items(titel, brand, size, condition, category, color, label_text, defects_text, item_photos(role, original_url, cleaned_url), generations(kind, status, output_url, created_at))",
        )
        .eq("status", "aaben")
        .order("oprettet_at", { ascending: true }),
    ]);
  let besoegData = foersteForsoeg.data;
  let harUnik = !foersteForsoeg.error;
  if (foersteForsoeg.error) {
    ({ data: besoegData } = await besoegQuery(besoegSelect));
    harUnik = false;
  }
  const alleBesoeg = (besoegData ?? []) as unknown as BesoegRaekke[];

  // Kilde-normalisering: UTM vinder over referrer. OBS: TikToks in-app-browser
  // sender sjældent en referrer, så uden ?utm_source=tiktok lander trafikken
  // i "direkte" — derfor er UTM-linket i bio afgørende.
  const kildeAf = (b: BesoegRaekke): string => {
    if (b.utm_source) return b.utm_source.toLowerCase();
    const host = (b.referrer_host ?? "").toLowerCase().replace(/^www\./, "");
    if (host === "") return "direkte";
    if (host.includes("tiktok")) return "tiktok";
    if (host.includes("google")) return "google";
    if (host.includes("instagram")) return "instagram";
    if (host.includes("facebook") || host.includes("fb.")) return "facebook";
    if (host.includes("vinted")) return "vinted";
    return host;
  };

  const besoeg = valgtKilde
    ? alleBesoeg.filter((b) => kildeAf(b) === valgtKilde)
    : alleBesoeg;

  const talOp = (vaerdier: (string | null)[]): [string, number][] => {
    const m = new Map<string, number>();
    for (const v of vaerdier) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  };
  // Unikke = antal forskellige besøgende-hashes. Hashen roterer ved midnat,
  // så en der kommer igen i morgen tælles som ny — det siger copy'en ærligt.
  const unikke = (raekker: BesoegRaekke[]): number | null =>
    harUnik
      ? new Set(raekker.map((b) => b.besoegende).filter(Boolean) as string[]).size
      : null;
  const unikkeIAlt = unikke(besoeg);

  const dage = [...new Set(besoeg.map((b) => b.created_at.slice(0, 10)))].sort();
  const prDagRaekker: [string, string][] = dage.map((dag) => {
    const paaDagen = besoeg.filter((b) => b.created_at.slice(0, 10) === dag);
    const u = unikke(paaDagen);
    return [dag, u != null ? `${u} / ${paaDagen.length}` : String(paaDagen.length)];
  });

  // Kilder med BÅDE unikke og visninger, så man kan se hvad TikTok reelt gav
  const kildeNavne = [...new Set(besoeg.map(kildeAf))];
  const kildeRaekker: [string, string][] = kildeNavne
    .map((navn) => {
      const raekker = besoeg.filter((b) => kildeAf(b) === navn);
      const u = unikke(raekker);
      return {
        navn,
        antal: raekker.length,
        tekst: u != null ? `${u} / ${raekker.length}` : String(raekker.length),
      };
    })
    .sort((a, b) => b.antal - a.antal)
    .slice(0, 10)
    .map((k) => [k.navn, k.tekst]);

  const topSider = talOp(besoeg.map((b) => b.sti)).map(
    ([n, a]) => [n, String(a)] as [string, string],
  );
  const topKampagner = talOp(
    besoeg.map((b) =>
      b.utm_source ? [b.utm_source, b.utm_medium, b.utm_campaign].filter(Boolean).join(" / ") : null,
    ),
  ).map(([n, a]) => [n, String(a)] as [string, string]);
  const mobilAndel =
    besoeg.length > 0
      ? Math.round((besoeg.filter((b) => b.enhed === "mobil").length / besoeg.length) * 100)
      : null;
  // Filter-links bevarer den anden parameter
  const filterHref = (nyeVaerdier: { dage?: number; kilde?: string }): string => {
    const p = new URLSearchParams();
    const d = nyeVaerdier.dage ?? valgtDage;
    const k = nyeVaerdier.kilde !== undefined ? nyeVaerdier.kilde : valgtKilde;
    if (d !== 7) p.set("dage", String(d));
    if (k) p.set("kilde", k);
    const q = p.toString();
    return `/admin${q ? `?${q}` : ""}#trafik`;
  };

  // Kontakt-henvendelser (21/8 nat) — navn+email står i rækken selv
  const henvendelserData = henvendelserSvar.data;
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
  const feedbackProfiler = feedbackProfilerSvar.data;
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

  const { data } = generationsSvar;

  type Raekke = {
    kind: string;
    status: string;
    cost_dkk: number | null;
    created_at: string;
    fejl?: string | null;
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

  // Trial-tal (25/8): dagens forbrug/antal + konvertering trial → signup.
  // Fejltolerant før trial-migrationen er kørt — null viser vejledningen.
  const midnatUtc = new Date();
  midnatUtc.setUTCHours(0, 0, 0, 0);
  const trialIndstillinger =
    (await hentTrialIndstillinger()) ?? STANDARD_TRIAL_INDSTILLINGER;
  const trialTal = await (async () => {
    try {
      const [dagens, blokeret, completedIAlt, signups] = await Promise.all([
        service
          .from("trial_usage")
          .select("status, cost_estimat_dkk")
          .gte("created_at", midnatUtc.toISOString()),
        service
          .from("trial_events")
          .select("id", { count: "exact", head: true })
          .eq("event", "trial_blocked")
          .gte("created_at", midnatUtc.toISOString()),
        // Kodereview 25/8: tælles completed fra trial_usage, driver 90-dages
        // oprydningen konverteringen over 100 % — begge sider fra trial_events
        service
          .from("trial_events")
          .select("id", { count: "exact", head: true })
          .eq("event", "trial_completed"),
        service
          .from("trial_events")
          .select("id", { count: "exact", head: true })
          .eq("event", "trial_to_signup"),
      ]);
      if (dagens.error) return null;
      const raekker = (dagens.data ?? []) as {
        status: string;
        cost_estimat_dkk: number | null;
      }[];
      return {
        forbrugDkk: raekker.reduce((sum, r) => sum + Number(r.cost_estimat_dkk ?? 0), 0),
        completed: raekker.filter((r) => r.status === "completed").length,
        failed: raekker.filter((r) => r.status === "failed").length,
        blokeret: blokeret.count ?? 0,
        completedIAlt: completedIAlt.count ?? 0,
        signups: signups.count ?? 0,
      };
    } catch {
      return null;
    }
  })();

  const klageData = klageSvar.data;

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

      {/* Fejl ved billedgenerering (ejer-ordre 23/8): årsagen skal kunne
          ses her — ikke kun i serverloggen */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.genFejl.titel}</h2>
      {raekker.filter((r) => r.status === "failed").length === 0 ? (
        <p className="mt-2 text-detalje text-tekst/70">{da.admin.genFejl.tom}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2 font-mono text-detalje">
          {raekker
            .filter((r) => r.status === "failed")
            .slice(0, 15)
            .map((r, i) => (
              <li key={i} className="rounded-bloed border border-kant bg-flade p-2">
                <span className="text-fejl">
                  {r.created_at.slice(5, 16).replace("T", " ")} · {r.kind}
                </span>
                <span className="block break-words text-tekst/80">
                  {r.fejl ?? da.admin.genFejl.udenTekst}
                </span>
              </li>
            ))}
        </ul>
      )}

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

      {/* Trafik: cookieløs statistik med filtre og unikke besøgende (22/8,
          TikTok-lancering) — perioden og kilden styres af ?dage=/?kilde= */}
      <h2 id="trafik" className="mt-8 scroll-mt-4 text-titel font-medium">
        {da.admin.trafik.titel}
      </h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.trafik.forklaring}
        {harUnik ? ` ${da.admin.trafik.unikForklaring}` : ` ${da.admin.trafik.migrationMangler}`}
      </p>

      {/* Periode */}
      <div className="mt-3 flex flex-wrap gap-2">
        {([1, 7, 30] as const).map((d) => (
          <a
            key={d}
            href={filterHref({ dage: d })}
            aria-current={valgtDage === d ? "true" : undefined}
            className={`inline-flex min-h-touch items-center rounded-bloed border px-3 text-detalje font-medium ${
              valgtDage === d
                ? "border-gran bg-gran text-kalk"
                : "border-kant bg-baggrund text-tekst/80 hover:border-koks"
            }`}
          >
            {da.admin.trafik.periode[d]}
          </a>
        ))}
      </div>

      {/* Kilde-filter */}
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={filterHref({ kilde: "" })}
          aria-current={valgtKilde === "" ? "true" : undefined}
          className={`inline-flex min-h-touch items-center rounded-bloed border px-3 text-detalje ${
            valgtKilde === ""
              ? "border-koks bg-flade font-medium"
              : "border-kant bg-baggrund text-tekst/70 hover:border-koks"
          }`}
        >
          {da.admin.trafik.alleKilder}
        </a>
        {[...new Set(alleBesoeg.map(kildeAf))].slice(0, 8).map((k) => (
          <a
            key={k}
            href={filterHref({ kilde: k })}
            aria-current={valgtKilde === k ? "true" : undefined}
            className={`inline-flex min-h-touch items-center rounded-bloed border px-3 text-detalje ${
              valgtKilde === k
                ? "border-koks bg-flade font-medium"
                : "border-kant bg-baggrund text-tekst/70 hover:border-koks"
            }`}
          >
            {k}
          </a>
        ))}
      </div>

      {/* Nøgletal */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            [da.admin.trafik.unikke, unikkeIAlt != null ? String(unikkeIAlt) : "—"],
            [da.admin.trafik.visninger, String(besoeg.length)],
            [
              da.admin.trafik.prBesoegende,
              unikkeIAlt && unikkeIAlt > 0
                ? (besoeg.length / unikkeIAlt).toFixed(1).replace(".", ",")
                : "—",
            ],
            [da.admin.trafik.mobil, mobilAndel != null ? `${mobilAndel} %` : "—"],
          ] as const
        ).map(([navn, vaerdi]) => (
          <div key={navn} className="rounded-bloed border border-kant bg-flade p-3">
            <p className="font-mono text-detalje uppercase tracking-wide text-tekst/60">
              {navn}
            </p>
            <p className="mt-1 font-mono text-titel font-bold">{vaerdi}</p>
          </div>
        ))}
      </div>

      {besoeg.length === 0 ? (
        <p className="mt-3 text-detalje text-tekst/70">{da.admin.trafik.tom}</p>
      ) : (
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {(
            [
              [da.admin.trafik.prDag, prDagRaekker],
              [da.admin.trafik.topKilder, kildeRaekker],
              [da.admin.trafik.topSider, topSider],
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

      {/* Gratis trial (25/8): toggle + budgetloft + dagens tal og konvertering */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.trial.titel}</h2>
      <p className="mt-1 max-w-laesbar text-detalje text-tekst/70">
        {da.admin.trial.forklaring}
      </p>
      {trialTal ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-detalje text-tekst/70">{da.admin.trial.dagensForbrug}</p>
            <p className="mt-1 font-mono text-titel">
              {trialTal.forbrugDkk.toFixed(2)} / {trialIndstillinger.dagligtBudgetDkk} kr.
            </p>
          </Card>
          <Card>
            <p className="text-detalje text-tekst/70">{da.admin.trial.dagensTrials}</p>
            <p className="mt-1 font-mono text-titel">
              {da.admin.trial.dagensTrialsTal(
                trialTal.completed,
                trialTal.failed,
                trialTal.blokeret,
              )}
            </p>
          </Card>
          <Card>
            <p className="text-detalje text-tekst/70">{da.admin.trial.konvertering}</p>
            <p className="mt-1 font-mono text-titel">
              {da.admin.trial.konverteringTal(trialTal.signups, trialTal.completedIAlt)}
            </p>
          </Card>
        </div>
      ) : (
        <p className="mt-3 text-detalje text-tekst/70">{da.admin.trial.migrationMangler}</p>
      )}
      <TrialIndstillinger
        startAktiv={trialIndstillinger.aktiv}
        startBudgetDkk={trialIndstillinger.dagligtBudgetDkk}
      />

      {/* Billedmodel (23/8): hvilken model brugerne kører på — uden deploy */}
      <h2 className="mt-8 text-titel font-medium">{da.admin.billedmodel.titel}</h2>
      <BilledModelValg modeller={billedModeller} valg={modelValg} />

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
