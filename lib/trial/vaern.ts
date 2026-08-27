// Misbrugsværnene for den gratis prøve — ALLE checks er server-side og kører
// FØR noget koster penge. Rækkefølgen er billigst-først: admin-toggle og
// budgetloft (databasen er sandheden, aldrig env/build — ejeren lukker trialen
// uden deploy), derefter time-cap og cookie.
//
// IP'EN BLOKERER IKKE (ejer-ordre 27/8). Dansk mobiltrafik deler IP gennem
// operatørens CGNAT, og trafikken til /prov kommer fra TikTok — altså næsten
// udelukkende fra telefoner. Én gennemført prøve ville derfor spærre vildt
// fremmede på samme mastenet i 7 dage, uden at de nogensinde fik at vide
// hvorfor. Det er samme fælde som fingerprintet allerede var i (se
// trialFingerprintHash): et signal der rammer kohorter, ikke personer.
// ip_hash GEMMES fortsat på rækken til misbrugsanalyse — den blokerer bare
// ingen. De hårde værn er nu budgetloftet og time-cappen, som begge har et
// tal ejeren selv styrer i /admin.
//
// Fejlsikret LUKKET — modsat rate_limit-tælleren: her står API-budgettet
// direkte på spil, og en prøve er aldrig kritisk for en betalende bruger.
// Kan værnet ikke afgøres (DB nede), afvises prøven venligt.
//
// Rå IP gemmes ALDRIG (privatlivsløftet fra ratelimit.ts) — kun 16 tegn af
// SHA-256-hashen, nok til at tælle, umuligt at vende tilbage.

import { createHash } from "node:crypto";
import { trial } from "@/lib/config";

export type TrialBlokAarsag =
  | "lukket"
  | "budget"
  | "time"
  | "cookie";

export type TrialVaernSvar =
  | { tilladt: true }
  | { tilladt: false; aarsag: TrialBlokAarsag };

/** Databasen bag værnet — interface, så alt kan testes uden Supabase (NFR-5) */
export type TrialVaernDb = {
  /** Admin-indstillingen — null når den ikke kan læses (→ fejlsikret lukket) */
  hentIndstillinger(): Promise<{ aktiv: boolean; dagligtBudgetDkk: number } | null>;
  /** Summen af cost_estimat_dkk for indeværende UTC-døgn */
  dagensForbrugDkk(): Promise<number>;
  /** Antal startede trials den seneste time (spike-beskyttelse) */
  antalSidsteTime(): Promise<number>;
  /** Findes en COMPLETED trial med denne kolonneværdi i vinduet? */
  harCompleted(
    kolonne: "ip_hash" | "fingerprint_hash" | "token_hash",
    vaerdi: string,
    sidenIso: string,
  ): Promise<boolean>;
};

/**
 * Hashet klient-IP — samme headers som resten af appen (Netlify først).
 * GEMMES til misbrugsanalyse (hvor mange forsøg kom fra samme net?), men
 * BLOKERER aldrig: se filens hoved om CGNAT.
 */
export function trialIpHash(request: Request): string {
  const raa =
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "ukendt";
  return createHash("sha256").update(raa).digest("hex").slice(0, 16);
}

/**
 * Sekundært signal (værn c): user-agent + accept-headers + klientens
 * skærmdata, hashet. VIGTIGT (kodereview 25/8): på iOS er user-agenten
 * frosset, så ALLE iPhones af samme model med dansk locale deler hash — én
 * gennemført trial ville blokere hele kohorten i 7 dage. Derfor GEMMES
 * fingerprintet kun (til misbrugsanalyse i admin/SQL) og blokerer ALDRIG
 * alene; IP, cookie, time-cap og budgetloft bærer de hårde værn.
 */
export function trialFingerprintHash(request: Request, skaerm: string): string {
  const dele = [
    request.headers.get("user-agent") ?? "",
    request.headers.get("accept") ?? "",
    request.headers.get("accept-language") ?? "",
    request.headers.get("accept-encoding") ?? "",
    skaerm.slice(0, 60),
  ].join("|");
  return createHash("sha256").update(dele).digest("hex").slice(0, 16);
}

/** Tokens gemmes kun hashet — en databaselæk åbner ingen resultater */
export function trialTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Høsteren (kodereview 25/8): en trial der har kørt længere end loftet +
 *  margin er reelt død (død proces eller crashet job) og skal markeres failed,
 *  så den hverken står i evigt "running" eller mangler i admin-tallene.
 *  Vinduet ligger EFTER klientens samlede ventetid (prod-hændelse 26/8: det
 *  gamle 3-minutters vindue fyrede FØR klientens 4-minutters loft, så det var
 *  høsteren — ikke kørslen — der viste de besøgende fejlen): høsten er ren
 *  bogføring og må aldrig være det, der afgør en ventende besøgendes skæbne. */
export const TRIAL_HAENGER_EFTER_MS = trial.klientVenteMs + 90_000;

export function erTrialHaengende(createdAtIso: string, nuMs: number = Date.now()): boolean {
  return nuMs - new Date(createdAtIso).getTime() > TRIAL_HAENGER_EFTER_MS;
}

export type TrialKoereDom = "koer" | "spring-over" | "opgivet";

/**
 * Skal en kørsel, der er nået frem til en worker (Trigger.dev eller lokal
 * proces), overhovedet køre? "spring-over": rækken er allerede afgjort
 * (høstet/afsluttet) — rør den ikke. "opgivet": kørslen nåede ikke at starte
 * inden kø-deadlinen (kø under spidsbelastning) — den besøgende er væk, så
 * ingen provider-kald: et sent COMPLETED ville koste penge for et resultat,
 * ingen ser, og urimeligt låse IP'en i 7 dage.
 */
export function boerTrialKoere(
  raekke: { status: string; created_at: string } | null,
  nuMs: number = Date.now(),
): TrialKoereDom {
  if (!raekke || raekke.status !== "running") return "spring-over";
  if (nuMs - new Date(raekke.created_at).getTime() > trial.koeDeadlineMs) return "opgivet";
  return "koer";
}

export function trialVindueStartIso(nuMs: number = Date.now()): string {
  return new Date(nuMs - trial.ipVinduesDage * 86_400_000).toISOString();
}

/**
 * Hele værnet i ét kald. Kun COMPLETED trials blokerer cookie/IP
 * (ejer-beslutning: en fejlet prøve låser ikke — den besøgende har ét ærligt
 * forsøg mere; budgetloftet fanger misbrug af det). Fingerprintet gemmes
 * men blokerer ikke (se trialFingerprintHash).
 */
export async function tjekTrialVaern(
  db: TrialVaernDb,
  klient: {
    ipHash: string;
    /** Verificeret token fra den signerede cookie — null uden gyldig cookie */
    cookieToken: string | null;
  },
  nuMs: number = Date.now(),
): Promise<TrialVaernSvar> {
  try {
    // 1) Admin-toggle + budgetloft — databasen er sandheden (ingen deploy)
    const indstillinger = await db.hentIndstillinger();
    if (!indstillinger || !indstillinger.aktiv) {
      return { tilladt: false, aarsag: "lukket" };
    }
    if ((await db.dagensForbrugDkk()) + trial.costEstimatDkk > indstillinger.dagligtBudgetDkk) {
      return { tilladt: false, aarsag: "budget" };
    }

    // 2) Spike-beskyttelse: alle startede trials tæller (også fejlede — en
    // angriber må ikke kunne pumpe fejlede kørsler igennem i højt tempo)
    if ((await db.antalSidsteTime()) >= trial.maksPrTime) {
      return { tilladt: false, aarsag: "time" };
    }

    // 3) Én pr. browser: cookien er det ENESTE person-værn der blokerer.
    // IP'en blokerer IKKE (ejer-ordre 27/8) — se filens hoved.
    const siden = trialVindueStartIso(nuMs);
    if (
      klient.cookieToken &&
      (await db.harCompleted("token_hash", trialTokenHash(klient.cookieToken), siden))
    ) {
      return { tilladt: false, aarsag: "cookie" };
    }

    return { tilladt: true };
  } catch {
    // Fejlsikret LUKKET — se filens hoved
    return { tilladt: false, aarsag: "lukket" };
  }
}
