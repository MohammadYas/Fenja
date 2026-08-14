// Eneste kilde til farver, typografi, spacing og radius (HANDOFF §2.2.1).
// Tailwind-temaet og alle komponenter deriverer herfra — ingen ad hoc-værdier.
// Begrundelser og kontrast-regler: se DESIGN.md.

export const farver = {
  kalk: "#F1F3F2",
  koks: "#212523",
  gran: "#24513F",
  hoer: "#D8D3C6",
  rav: "#C97F1B",
  ravDyb: "#9A6013",
  fejl: "#8C2F23",
} as const;

// Semantiske roller — komponenter bruger disse navne, ikke rå palette-navne,
// så en fremtidig mørk tilstand kun skal ændres ét sted.
export const roller = {
  baggrund: farver.kalk,
  tekst: farver.koks,
  primaer: farver.gran,
  primaerTekst: farver.kalk,
  flade: farver.hoer,
  kant: "rgb(33 37 35 / 0.15)", // koks/15 — flade-afgrænsning uden skygger
  pris: farver.ravDyb,
  detalje: farver.rav, // kun dekorativt eller ≥ 24 px display (DESIGN.md §2)
  fejl: farver.fejl,
} as const;

// CSS-variabelnavne sættes af next/font i app/fonts.ts.
export const skrifter = {
  display: "var(--font-display)", // Bricolage Grotesque
  brod: "var(--font-brod)", // Instrument Sans
  mono: "var(--font-mono)", // Spline Sans Mono — tabulære tal til priser
} as const;

// Navngivet typeskala (rem). Display-trin bruger skrifter.display.
type Typetrin = [string, { lineHeight: string }];

export const typeskala: Record<
  "detalje" | "basis" | "lead" | "titel" | "display" | "hero" | "mega",
  Typetrin
> = {
  detalje: ["0.8125rem", { lineHeight: "1.5" }],
  basis: ["1rem", { lineHeight: "1.6" }],
  lead: ["1.125rem", { lineHeight: "1.6" }],
  titel: ["1.375rem", { lineHeight: "1.3" }],
  display: ["1.75rem", { lineHeight: "1.2" }],
  hero: ["2.25rem", { lineHeight: "1.1" }],
  mega: ["3rem", { lineHeight: "1.05" }],
};

export const radius = {
  stram: "4px", // badges
  bloed: "8px", // knapper, felter, kort
} as const;

// Minimum touch-mål for interaktive elementer (NFR-1).
export const touchMaal = "44px";

// Bevægelse: kun tilstandsskift, altid dæmpet af prefers-reduced-motion.
export const bevaegelse = {
  varighed: "180ms",
  kurve: "ease-out",
} as const;
