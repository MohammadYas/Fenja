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

/**
 * ÉN fælles procent-beregning (ejer-ordre 20/8: oversigt og annonceside
 * viste 86 % vs. 75 % — de skal være ENIGE). Procenten følger nu det
 * FAKTISKE arbejde (80 % billeder + 20 % tekst) med tidskurven som blødt
 * gulv, så baren aldrig står stille og aldrig lyver — og max() gør den
 * monotont voksende. Loft 97 % indtil leverancen lander.
 */
export function beregnProcent(args: {
  startetAtMs: number;
  nuMs: number;
  forventetSek?: number;
  trin: FremdriftTrin[];
  /** Serverens sandhed om hvor mange billeder der ER bestilt (items.visninger) */
  totalBilleder?: number;
}): number {
  const billedeRaekker = args.trin.filter((t) => t.kind === "onmodel");
  const total =
    args.totalBilleder && args.totalBilleder > 0
      ? args.totalBilleder
      : billedeRaekker.length;
  const faerdige = billedeRaekker.filter((r) => r.status === "succeeded").length;
  const tekstRaekker = args.trin.filter((t) => t.kind === "text");
  const tekstKlaret = tekstRaekker.some(
    (r) => r.status === "succeeded" || r.status === "failed",
  );

  let reel = 0;
  if (total > 0) reel += 0.8 * Math.min(1, faerdige / total);
  if (tekstRaekker.length > 0) reel += 0.2 * (tekstKlaret ? 1 : 0.4);

  const tid = psykologiskAndel(args.startetAtMs, args.nuMs, args.forventetSek);
  return Math.min(97, Math.round(Math.max(reel, tid) * 100));
}
