// Eksperimentelle features (ejer-ordre 2026-08-16): alt her er TIL PRØVE og
// skal kunne slås fra på sekunder. To kill-switches, begge uden kodeændring i
// features:
//   1. Flip flaget herunder til false og deploy.
//   2. Sæt env EKSPERIMENTER_FRA="alle" (eller en kommasepareret liste af
//      flag-navne) — slår fra uden commit, fx direkte i Netlify-env.
// Ingen eksperiment-data må være opdigtet: alt afledes af den committede
// markedshøst (lib/data/markedspriser.ts) — ægte tal, ægte høstdato.

import { MARKEDSPRISER, type Markedsinterval } from "@/lib/data/markedspriser";

export const eksperimenter = {
  /** Forside-sektion: mest aktive søgninger fra markedshøsten */
  populaertLigeNu: true,
  /** Listen "giver mest ved gensalg" (højeste medianpris) i samme sektion */
  bedsteFund: true,
  /** Interaktiv pristjekker (vælg søgning → se interval) i samme sektion */
  prisTjek: true,
} as const;

export type EksperimentNavn = keyof typeof eksperimenter;

export function eksperimentAktiv(navn: EksperimentNavn): boolean {
  const fra = process.env.EKSPERIMENTER_FRA?.trim();
  if (fra) {
    if (fra === "alle") return false;
    if (
      fra
        .split(",")
        .map((del) => del.trim())
        .includes(navn)
    ) {
      return false;
    }
  }
  return eksperimenter[navn];
}

/** Mest aktive søgninger (flest aktive annoncer) — "populært lige nu". */
export function hentPopulaere(antal = 6): Markedsinterval[] {
  return [...MARKEDSPRISER].sort((a, b) => b.antal - a.antal).slice(0, antal);
}

/** Højeste medianpris — "giver mest ved gensalg" (sourcing-vinklen). */
export function hentBedsteFund(antal = 5): Markedsinterval[] {
  return [...MARKEDSPRISER]
    .sort((a, b) => b.medianDkk - a.medianDkk)
    .slice(0, antal);
}

/** Seneste høstdato i datasættet (ISO) — null hvis høsten er tom. */
export function nyesteHoestDato(): string | null {
  if (MARKEDSPRISER.length === 0) return null;
  return MARKEDSPRISER.map((m) => m.hoestetDato).sort().at(-1) ?? null;
}
