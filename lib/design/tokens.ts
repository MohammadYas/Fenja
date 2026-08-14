// Eneste kilde til farver, typografi, spacing og radius (HANDOFF §2.2.1).
// Tailwind-temaet og alle komponenter deriverer herfra — ingen ad hoc-værdier.
// Begrundelser og kontrast-regler: se DESIGN.md; v2-retningen ("katalog møder
// plakat"): se REDESIGN.md.

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
// v2: plakat-trinnene (REDESIGN §2.1) — clamp så 320 px aldrig scroller vandret.
type Typetrin = [string, { lineHeight: string; letterSpacing?: string }];

export const typeskala: Record<
  | "detalje"
  | "basis"
  | "lead"
  | "titel"
  | "display"
  | "hero"
  | "mega"
  | "kaempe"
  | "plakat",
  Typetrin
> = {
  detalje: ["0.8125rem", { lineHeight: "1.5" }],
  basis: ["1rem", { lineHeight: "1.6" }],
  lead: ["1.125rem", { lineHeight: "1.6" }],
  titel: ["1.375rem", { lineHeight: "1.3" }],
  display: ["1.75rem", { lineHeight: "1.2" }],
  hero: ["2.25rem", { lineHeight: "1.1" }],
  mega: ["3rem", { lineHeight: "1.05" }],
  kaempe: ["clamp(2.5rem, 10vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
  plakat: [
    "clamp(3.25rem, 15vw, 9rem)",
    { lineHeight: "0.95", letterSpacing: "-0.02em" },
  ],
};

export const radius = {
  stram: "4px", // badges
  bloed: "8px", // knapper, felter, kort
} as const;

// Minimum touch-mål for interaktive elementer (NFR-1).
export const touchMaal = "44px";

// Bevægelse (REDESIGN §2.5): mikro, aldrig cirkus. Alt bag prefers-reduced-motion.
export const bevaegelse = {
  varighed: "150ms", // tilstandsskift (hover/aktiv)
  reveal: "300ms", // scroll-reveal ind
  stagger: "60ms", // forskydning mellem søskende i reveal
  taeller: 400, // ms — tal der tæller op (saldo/statistik)
  kurve: "ease-out",
} as const;

// Offset-"skygge" (REDESIGN §2.4): solid, aldrig blur, aldrig sort —
// plakat-tricket. Kun på interaktive kort/knapper.
export const skygge = {
  offset: "4px 4px 0 0",
  offsetLoeft: "6px 6px 0 0", // hover: elementet løfter 2 px, skyggen vokser
} as const;

// Rotationstrin (REDESIGN §4): deterministiske pr. element — aldrig random,
// aldrig animeret rotation. Maks. 1–2 roterede motiver pr. view.
export const rotation = {
  stempel: "-3deg",
  lapVenstre: "-2deg",
  lapHoejre: "1.5deg",
  ramme: "1.5deg",
} as const;

// Vævnings-tekstur på kalk-flader (REDESIGN §2.4): skal kunne anes, ikke ses.
export const tekstur = {
  opacity: 0.015,
} as const;
