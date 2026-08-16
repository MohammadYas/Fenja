// AL brugervendt tekst i transaktionsmails samles her (NFR-12) — aldrig
// hårdkodet i skabelonerne i /emails. Samme regler som lib/copy/da.ts
// (HANDOFF §2.2.4): dansk, konkret, ærlig, lavmælt selvsikker; knapper siger
// hvad de gør; ingen buzzwords, ingen emojis. Håndhævet i tests/unit/emails-copy.test.ts.
// BEMÆRK: gratis-tier er afskaffet (STATUS 2026-08-15) — ingen mail må love
// gratis annoncer.

export const emails = {
  faelles: {
    afsenderNavn: "Selja",
    // Under knappen, til klienter der ikke viser knappen ordentligt.
    knapFallback: "Virker knappen ikke? Kopiér linket herunder ind i din browser:",
    footer:
      "Selja — rensede fotos, mærket visualisering og færdig annoncetekst til dit brugte tøj.",
    footerHvorfor: "Du får denne mail, fordi din e-mail er brugt hos Selja.",
  },
  magicLink: {
    emne: "Dit link til at logge ind",
    forhaandsvisning: "Tryk på linket, så er du logget ind. Det virker i en time.",
    overskrift: "Log ind hos Selja",
    brod: "Tryk på knappen, så er du logget ind. Linket virker i en time og kan kun bruges én gang.",
    knap: "Log mig ind",
    ikkeDig:
      "Har du ikke bedt om et link, kan du roligt ignorere denne mail. Ingen kommer ind på din konto uden linket.",
  },
  velkomst: {
    emne: "Din konto er klar",
    forhaandsvisning: "Sådan laver du din første annonce.",
    overskrift: "Din konto er klar",
    brod: "Velkommen til Selja. Sådan laver du en annonce:",
    trin: [
      "Tag 2–4 fotos af tøjet med din telefon.",
      "Udfyld mærke, størrelse, stand og kategori.",
      "Få rensede fotos, en mærket visualisering og en færdig annoncetekst — klar til at sætte ind på Vinted på cirka 2 minutter.",
    ],
    kreditNote:
      "Annoncer betales med kreditter: 1 kredit = 1 færdig annonce. Du køber kun det, du bruger, og kreditterne udløber ikke.",
    knap: "Lav min første annonce",
  },
  annonceKlar: {
    emne: (titel: string) => `Din annonce er klar: ${titel}`,
    forhaandsvisning: "Rensede fotos, visualisering og tekst ligger klar til Vinted.",
    overskrift: "Din annonce er klar",
    brod: (titel: string) =>
      `Annoncen for ${titel} er færdig: rensede fotos, mærket visualisering og annoncetekst med prisforslag.`,
    huskBillede1:
      "Husk: brug dit rensede helhedsfoto som billede 1 på Vinted. Visualiseringen er mærket og må kun bruges som supplement.",
    knap: "Se min annonce",
  },
  // Supplement til Stripes kvittering (E-6) — bekræfter at kreditterne er sat ind.
  kvittering: {
    emne: "Dine kreditter er sat ind",
    forhaandsvisning: "Betalingen gik igennem — saldoen er opdateret.",
    overskrift: "Dine kreditter er sat ind",
    brod: "Betalingen gik igennem, og kreditterne står på din saldo.",
    koebslinje: (antal: number, prisDkk: number) => `${antal} annoncer · ${prisDkk} kr.`,
    stripeNote:
      "Selve kvitteringen kommer i en separat mail fra Stripe, som håndterer betalingen.",
    udloeb: "Kreditterne udløber ikke — brug dem, når det passer dig.",
    knap: "Se min saldo",
  },
  // Delvis leverance (B-6): visualiseringen fejlede, resten er leveret,
  // kreditten er sat tilbage — samme sprog som resultat-sidens besked.
  kreditRefunderet: {
    emne: "Kreditten er sat tilbage — din annonce er klar",
    forhaandsvisning: "Visualiseringen blev ikke leveret; fotos og tekst er klar.",
    overskrift: "Kreditten er sat tilbage",
    brod: (titel: string) =>
      `Visualiseringen til ${titel} ramte ikke vores kvalitetskrav, så vi leverer den ikke — og kreditten er sat tilbage på din saldo.`,
    resten:
      "Dine rensede fotos og annonceteksten er klar og kan bruges på Vinted, som de er.",
    proevIgen:
      "Vil du have en visualisering alligevel, kan du prøve i et andet miljø fra annoncesiden.",
    knap: "Se min annonce",
  },
} as const;

export type EmailCopy = typeof emails;
