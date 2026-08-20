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
