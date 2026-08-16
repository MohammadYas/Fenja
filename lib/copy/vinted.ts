// Copy til forsiden (Vinted-landingen — STRATEGISKIFT 2026-08-15: appen ER
// produktet udadtil). Manifest-reglerne gælder (HANDOFF §2.2.4): dansk,
// konkret, ærlig — tonen er direkte og ung; B2B-copy bor i da.landing (/studio).

export const vinted = {
  meta: {
    titel: "Selja til Vinted: færdig annonce på cirka 2 minutter",
    beskrivelse:
      "Tag 2–4 mobilfotos af dit tøj. Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag. Klar til at sætte ind på Vinted.",
  },
  hero: {
    rubrik: "Din annonce. Færdig på cirka 2 minutter.",
    tekst:
      "Tag 2–4 fotos med telefonen. Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag. Du kopierer bare ind på Vinted.",
    tidsnote:
      "Selve annoncen tager cirka 2 minutter, når du er logget ind og har kreditter.",
    knap: "Lav min annonce",
  },
  foerEfter: {
    foer: {
      label: "Før",
      tekst: "blå strik sælges, str m tror jeg, brugt men fin",
      pris: "100 kr. eller byd",
    },
    efter: {
      label: "Efter · med Selja",
      titel: "Mørkeblå uldstrik · str. M",
      punkter: [
        "Rensede fotos, klar til Vinted",
        "Tøjet vist båret",
        "Fejl oplyst ærligt i teksten",
      ],
      pris: "Prisforslag: 120–160 kr.",
    },
  },
  billedserie: {
    titel: "Tøjet vist båret",
  },
  saadan: {
    titel: "Sådan virker det",
    trin: [
      {
        titel: "Fotografér",
        tekst: "Helhed, bagside, label og fejl. Dagslys er nok. Resten klarer Selja.",
      },
      {
        titel: "Selja arbejder",
        tekst:
          "Cirka 90 sekunder: rensede billeder, tøjet vist båret og en tekst, der lyder som dig, ikke som en reklame.",
      },
      {
        titel: "Ind på Vinted",
        tekst: "Kopiér titel og tekst, hent billederne, læg annoncen op. Færdig.",
      },
    ],
  },
  brugPaaVinted: {
    titel: "Sådan bruger du resultatet",
    punkter: [
      "Brug dit rensede helhedsfoto som billede 1.",
      "Læg billederne med tøjet båret længere nede som supplement.",
      "Gennemgå tekst og prisforslag, og læg selv annoncen op. Selja får ikke adgang til din Vinted-konto.",
    ],
  },
  laerTeaser: {
    titel: "Bliv skarpere til at sælge",
    tekst: "Korte guides om priser, fotos og sourcing. Gratis, også uden konto.",
    alleGuides: "Alle guides",
  },
  cta: {
    titel: "Prøv med det næste stykke tøj, du vil sælge",
    kreditNote:
      "Du skal bruge kreditter for at lave en annonce. Køb dem, når du er klar. Intet abonnement.",
    knap: "Opret dig og kom i gang",
  },
} as const;
