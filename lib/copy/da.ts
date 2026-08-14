// AL brugervendt tekst samles her (NFR-12) — aldrig hårdkodet i komponenter.
// Struktureret pr. flade, i18n-klar (NFR-13): en fremtidig en.ts spejler denne form.

export const da = {
  site: {
    navn: "Fenja",
    beskrivelse:
      "Upload mobilfotos af dit tøj og få rensede salgsbilleder, en mærket visualisering og en færdig annoncetekst — klar til Vinted.",
  },
  nav: {
    oversigt: "Oversigt",
    saadanVirkerDet: "Sådan virker det",
    priser: "Priser",
    laer: "Lær",
    konto: "Konto",
  },
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
  },
} as const;

export type Copy = typeof da;
