// Høster aktive Vinted-annoncer til markedsanalyse og gemmer sanerede
// snapshots under data/markedsanalyse/raa/ (gitignoreret).
//
//   npx tsx scripts/markedsanalyse/hent.ts [--sider 2] [--pauseMs 1500]
//       [--soeg "ganni kjole" --kategori Kjoler]
//
// Adfærd: læser robots-signalerne som en generisk agent (kataloget er
// tilladt; /member, /checkout m.fl. røres aldrig), holder LAV volumen
// (hård grænse på antal kald pr. kørsel), pauser mellem alle kald og
// stopper straks ved 429/403. Sælgerdata gemmes aldrig (se sanerItem).
// Køres i hånden af ejeren — aldrig i CI, aldrig fra appen.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sanerItem, type Snapshot, type Soegning } from "./faelles";
import { SOEGNINGER } from "./soegninger";

const BASE = "https://www.vinted.dk";
const PER_SIDE = 96; // katalogets maksimum
const MAKS_KALD_PR_KOERSEL = 60; // hård grænse — hold volumen lav
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

type Argumenter = {
  sider: number;
  pauseMs: number;
  soegninger: Soegning[];
};

function laesArgumenter(argv: string[]): Argumenter {
  const hent = (navn: string): string | null => {
    const i = argv.indexOf(`--${navn}`);
    const vaerdi = i >= 0 ? argv[i + 1] : undefined;
    return vaerdi !== undefined ? vaerdi : null;
  };
  const soeg = hent("soeg");
  const soegninger: Soegning[] = soeg
    ? [
        {
          navn: soeg.toLowerCase().replace(/[^a-z0-9æøå]+/g, "-"),
          soegetekst: soeg,
          kategori: hent("kategori") ?? "Egen søgning",
        },
      ]
    : SOEGNINGER;
  return {
    sider: Math.max(1, Number(hent("sider") ?? 2)),
    pauseMs: Math.max(800, Number(hent("pauseMs") ?? 1500)),
    soegninger,
  };
}

function pause(ms: number): Promise<void> {
  // Jitter så kald ikke falder i takt
  const medJitter = ms + Math.random() * ms * 0.5;
  return new Promise((klar) => setTimeout(klar, medJitter));
}

/** Anonym session: forsiden sætter de cookies, kataloget kræver */
async function hentSessionCookies(): Promise<string> {
  const svar = await fetch(`${BASE}/`, {
    headers: { "User-Agent": UA, "Accept-Language": "da-DK,da;q=0.9" },
  });
  if (!svar.ok) throw new Error(`Forsiden svarede ${svar.status} — kan ikke få session.`);
  // Samme cookie kan sættes flere gange (fx access_token_web først tom,
  // derefter med værdi) — sidste ikke-tomme værdi pr. navn vinder
  const prNavn = new Map<string, string>();
  for (const saetning of svar.headers.getSetCookie()) {
    const par = saetning.split(";")[0];
    if (!par) continue;
    const skille = par.indexOf("=");
    if (skille <= 0) continue;
    const navn = par.slice(0, skille).trim();
    const vaerdi = par.slice(skille + 1).trim();
    if (vaerdi !== "") prNavn.set(navn, vaerdi);
  }
  return [...prNavn].map(([navn, vaerdi]) => `${navn}=${vaerdi}`).join("; ");
}

async function hentKatalogside(
  cookies: string,
  soegetekst: string,
  side: number,
): Promise<{ status: number; krop: unknown }> {
  const url = new URL(`${BASE}/api/v2/catalog/items`);
  url.searchParams.set("search_text", soegetekst);
  url.searchParams.set("per_page", String(PER_SIDE));
  url.searchParams.set("page", String(side));
  url.searchParams.set("order", "newest_first");
  const svar = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "Accept-Language": "da-DK,da;q=0.9",
      Cookie: cookies,
    },
  });
  return { status: svar.status, krop: svar.ok ? await svar.json() : null };
}

async function koer(): Promise<void> {
  const arg = laesArgumenter(process.argv.slice(2));
  const raaMappe = path.join("data", "markedsanalyse", "raa");
  await mkdir(raaMappe, { recursive: true });

  console.log(
    `Markedsanalyse-høst: ${arg.soegninger.length} søgning(er) × ${arg.sider} side(r), pause ~${arg.pauseMs} ms`,
  );
  const cookies = await hentSessionCookies();
  const hentetTs = Math.floor(Date.now() / 1000);
  const stempel = new Date(hentetTs * 1000)
    .toISOString()
    .slice(0, 16)
    .replace(/[:T]/g, "-");

  let kald = 0;
  let gemtIAlt = 0;
  for (const soegning of arg.soegninger) {
    for (let side = 1; side <= arg.sider; side++) {
      if (kald >= MAKS_KALD_PR_KOERSEL) {
        console.log(`Stopper: nåede grænsen på ${MAKS_KALD_PR_KOERSEL} kald pr. kørsel.`);
        return;
      }
      await pause(arg.pauseMs);
      kald++;
      const { status, krop } = await hentKatalogside(cookies, soegning.soegetekst, side);
      if (status === 429 || status === 403) {
        console.error(`Fik ${status} — stopper høsten her. Prøv igen senere med længere pause.`);
        return;
      }
      const data =
        typeof krop === "object" && krop !== null
          ? (krop as { items?: unknown[]; pagination?: { total_entries?: number } })
          : null;
      if (!data?.items) {
        console.error(`  ${soegning.navn} side ${side}: uventet svar (${status}) — springer over.`);
        continue;
      }
      const items = data.items
        .map((raaItem) => sanerItem(raaItem, soegning, hentetTs))
        .filter((i): i is NonNullable<typeof i> => i !== null);
      const snapshot: Snapshot = {
        soegning,
        side,
        hentetTs,
        totaltUdbud: data.pagination?.total_entries ?? null,
        items,
      };
      const fil = path.join(raaMappe, `${soegning.navn}-side${side}-${stempel}.json`);
      await writeFile(fil, JSON.stringify(snapshot, null, 1), "utf8");
      gemtIAlt += items.length;
      console.log(
        `  ${soegning.navn} side ${side}: ${items.length} annoncer (udbud i alt: ${snapshot.totaltUdbud ?? "?"})`,
      );
      if (items.length < PER_SIDE) break; // sidste side for søgningen
    }
  }
  console.log(`Færdig: ${gemtIAlt} annoncer gemt i ${raaMappe} (${kald} kald).`);
}

koer().catch((fejl) => {
  console.error("Høsten fejlede:", fejl instanceof Error ? fejl.message : fejl);
  process.exitCode = 1;
});
