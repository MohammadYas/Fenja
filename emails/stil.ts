// E-mail-safe stilværdier AFLEDT af design-tokens (HANDOFF §2.2.1) — ingen
// ad hoc-farver. Mails kan hverken bruge webfonts, CSS-variabler eller rgba
// (Outlook), så skrift-rollerne oversættes til systemstakke, rem-trin til px,
// og gennemsigtige kanter til faste blandingsfarver.

import { farver, radius, typeskala } from "@/lib/design/tokens";

/** Blander `oven` over `under` med given andel (0–1) til en fast hex-farve. */
export function blandFarver(oven: string, under: string, andel: number): string {
  const kanal = (hex: string, i: number) =>
    parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(kanal(oven, i) * andel + kanal(under, i) * (1 - andel))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** "1.375rem" → "22px" — mails skal bruge px. */
export function remTilPx(rem: string): string {
  return `${Math.round(parseFloat(rem) * 16)}px`;
}

export const emailFarver = {
  baggrund: farver.kalk,
  tekst: farver.koks,
  // Dæmpet tekst og hairline: koks blandet i kalk (roller.kant er rgba og
  // falder ud i ældre mail-klienter — samme dosering, fast farve).
  daempet: blandFarver(farver.koks, farver.kalk, 0.72),
  hairline: blandFarver(farver.koks, farver.kalk, 0.15),
  knap: farver.gran,
  knapTekst: farver.kalk,
  flade: farver.hoer,
  pris: farver.ravDyb,
} as const;

// Skrift-rollerne fra tokens.ts oversat til stakke, mail-klienter har.
export const emailSkrifter = {
  brod: "Arial, Helvetica, sans-serif",
  mono: "'Courier New', Courier, monospace",
} as const;

export const emailTypo = {
  detalje: remTilPx(typeskala.detalje[0]),
  basis: remTilPx(typeskala.basis[0]),
  titel: remTilPx(typeskala.titel[0]),
} as const;

export const emailRadius = radius;
