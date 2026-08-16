// Pricing v3.0: saldoen er stadig summen af ledgeren (E-3), men beregnes nu
// ved kronologisk genafspilning, så hver kredit kender sin kilde og sit udløb:
//   - positive bevægelser er "partier" (kilde + købsdato + evt. udløbsdato)
//   - forbrug dækkes af partierne i den strategiske rækkefølge (se ledger.ts)
//   - udløbne kreditter bortfalder automatisk af beregningen
// Denne fil er den rene reference-implementering (NFR-5: testbar uden
// Supabase); SQL-funktionen beregn_kredit_status (migration 20260816100000)
// spejler præcis samme semantik.

export type KreditKilde = "subscription" | "topup" | "pack";

export type BeregnLinje = {
  delta: number;
  ts: Date;
  kilde?: KreditKilde | null;
  udloeber?: Date | null;
};

export type KreditStatus = {
  saldo: number;
  prKilde: { subscription: number; topup: number; pack: number; oevrige: number };
  /** Tidligste udløb blandt aktive kreditter — til ærlig visning på kreditsiden */
  naesteUdloeb: { dato: Date; antal: number } | null;
};

// Forbrugsprioritet: subscription (1) → topup (2) → pack (3) → øvrige (4).
// Øvrige = refunds og bevægelser fra før v3.0 (ingen kilde): de udløber
// aldrig og brændes sidst — det mest generøse valg for brugeren.
const PRIO: Record<KreditKilde, number> = { subscription: 1, topup: 2, pack: 3 };
const PRIO_OEVRIGE = 4;

type Parti = {
  prio: number;
  kilde: KreditKilde | null;
  ts: number;
  udloeber: number | null;
  rest: number;
};

const rund = (n: number): number => Math.round(n * 100) / 100;

function aktivVed(parti: Parti, tidspunkt: number): boolean {
  return parti.rest > 0 && (parti.udloeber === null || parti.udloeber > tidspunkt);
}

// Blandt aktive partier: lavest prioritet, dernæst tidligst udløb (intet
// udløb sidst), dernæst ældste købsdato (FIFO — flaget ejer-valg, se PR).
function vaelgParti(partier: Parti[], tidspunkt: number): Parti | null {
  let bedst: Parti | null = null;
  for (const parti of partier) {
    if (!aktivVed(parti, tidspunkt)) continue;
    if (bedst === null) {
      bedst = parti;
      continue;
    }
    const udloeb = parti.udloeber ?? Infinity;
    const bedstUdloeb = bedst.udloeber ?? Infinity;
    if (
      parti.prio < bedst.prio ||
      (parti.prio === bedst.prio &&
        (udloeb < bedstUdloeb || (udloeb === bedstUdloeb && parti.ts < bedst.ts)))
    ) {
      bedst = parti;
    }
  }
  return bedst;
}

export function beregnKreditStatus(linjer: BeregnLinje[], naar: Date = new Date()): KreditStatus {
  const tidspunktNu = naar.getTime();
  const sorteret = [...linjer]
    .map((linje, indeks) => ({ linje, indeks }))
    .sort((a, b) => a.linje.ts.getTime() - b.linje.ts.getTime() || a.indeks - b.indeks)
    .map(({ linje }) => linje)
    .filter((linje) => linje.ts.getTime() <= tidspunktNu);

  const partier: Parti[] = [];
  let underskud = 0;

  for (const linje of sorteret) {
    if (linje.delta > 0) {
      const kilde = linje.kilde ?? null;
      partier.push({
        prio: kilde ? PRIO[kilde] : PRIO_OEVRIGE,
        kilde,
        ts: linje.ts.getTime(),
        udloeber: linje.udloeber ? linje.udloeber.getTime() : null,
        rest: linje.delta,
      });
    } else if (linje.delta < 0) {
      let mangler = -linje.delta;
      while (mangler > 0) {
        const parti = vaelgParti(partier, linje.ts.getTime());
        if (parti === null) {
          // Kan kun ske i en legacy-ledger — underskuddet trækkes fra saldoen,
          // aldrig skjules
          underskud += mangler;
          break;
        }
        const tag = Math.min(mangler, parti.rest);
        parti.rest = rund(parti.rest - tag);
        mangler = rund(mangler - tag);
      }
    }
  }

  const prKilde = { subscription: 0, topup: 0, pack: 0, oevrige: 0 };
  let saldo = 0;
  let naesteUdloeb: { dato: Date; antal: number } | null = null;
  for (const parti of partier) {
    if (!aktivVed(parti, tidspunktNu)) continue;
    saldo += parti.rest;
    if (parti.kilde) prKilde[parti.kilde] += parti.rest;
    else prKilde.oevrige += parti.rest;
    if (parti.udloeber !== null) {
      if (naesteUdloeb === null || parti.udloeber < naesteUdloeb.dato.getTime()) {
        naesteUdloeb = { dato: new Date(parti.udloeber), antal: parti.rest };
      } else if (parti.udloeber === naesteUdloeb.dato.getTime()) {
        naesteUdloeb.antal = rund(naesteUdloeb.antal + parti.rest);
      }
    }
  }

  return {
    saldo: rund(saldo - underskud),
    prKilde: {
      subscription: rund(prKilde.subscription),
      topup: rund(prKilde.topup),
      pack: rund(prKilde.pack),
      oevrige: rund(prKilde.oevrige),
    },
    naesteUdloeb,
  };
}
