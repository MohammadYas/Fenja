// Psykologisk fremdriftskurve (ejer-ordre 2026-08-20): altid fremad, hurtig
// start, asymptotisk mod ~93 %. Forankret i annoncens starttid fra serveren,
// så den er DETERMINISTISK — oversigt, annonceside og refresh viser præcis
// samme position med det samme. Skaleret efter forventet varighed: rigtige
// provider-kørsler tager 2-3 minutter PR. BILLEDE (ejer-erfaring 20/8), så
// kurven må ikke ligge på 93 % efter ét minut.

/** Realistisk forventning pr. billede (generering + troskabstjek + retry) */
export const SEK_PR_BILLEDE = 150;
const SEK_BASIS = 30; // rens + tekst

export function forventetSekunder(antalBilleder: number): number {
  return SEK_BASIS + SEK_PR_BILLEDE * Math.max(1, antalBilleder);
}

export function psykologiskAndel(
  startetAtMs: number,
  nuMs: number,
  forventetSek: number = forventetSekunder(1),
): number {
  const sekunder = Math.max(0, (nuMs - startetAtMs) / 1000);
  // tau valgt så kurven står på ~83 % ved forventet tid — og stadig kryber
  return 0.93 * (1 - Math.exp(-sekunder / (forventetSek / 2.2)));
}

export type FremdriftTrin = { kind: string; status: string };

// De trin brugeren ser (rens er en teknikalitet)
const VISTE_TRIN = ["text", "onmodel"] as const;

/**
 * ÉN fælles procent-beregning (ejer-ordre 20/8: oversigt og annonceside
 * viste 86 % vs. 75 % — de skal være ENIGE). max(tidskurve, reelle trin),
 * loft 97 % indtil leverancen lander.
 */
export function beregnProcent(args: {
  startetAtMs: number;
  nuMs: number;
  forventetSek?: number;
  trin: FremdriftTrin[];
}): number {
  const reel =
    VISTE_TRIN.reduce((sum, kind) => {
      const raekker = args.trin.filter((t) => t.kind === kind);
      if (raekker.length === 0) return sum;
      const faerdige = raekker.filter(
        (r) => r.status === "succeeded" || r.status === "failed",
      ).length;
      if (faerdige === raekker.length) return sum + 1;
      return sum + Math.max(0.15, faerdige / raekker.length);
    }, 0) / VISTE_TRIN.length;
  const tid = psykologiskAndel(args.startetAtMs, args.nuMs, args.forventetSek);
  return Math.min(97, Math.round(Math.max(tid, reel) * 100));
}
