// Psykologisk fremdriftskurve (ejer-ordre 2026-08-20): altid fremad, hurtig
// start, asymptotisk mod ~93 %. Forankret i annoncens starttid fra serveren,
// så den er DETERMINISTISK — oversigt, annonceside og refresh viser præcis
// samme position med det samme.
export function psykologiskAndel(startetAtMs: number, nuMs: number): number {
  const sekunder = Math.max(0, (nuMs - startetAtMs) / 1000);
  return 0.93 * (1 - Math.exp(-sekunder / 35));
}
