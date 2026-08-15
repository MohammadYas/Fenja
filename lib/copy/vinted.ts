// Copy til forsiden (Vinted-landingen — STRATEGISKIFT 2026-08-15: appen ER
// produktet udadtil). Manifest-reglerne gælder (HANDOFF §2.2.4): dansk,
// konkret, ærlig — tonen er direkte og ung; B2B-copy bor i da.landing (/studio).

export const vinted = {
  meta: {
    titel: "Fenja til Vinted — færdig annonce på 2 minutter",
    beskrivelse:
      "Tag 2–4 mobilfotos af dit tøj. Fenja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag — klar til at sætte ind på Vinted.",
  },
  hero: {
    maerkat: "Fenja til Vinted",
    rubrik: "Din annonce. Færdig på 2 minutter.",
    tekst:
      "Tag 2–4 fotos med telefonen. Fenja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag — du kopierer bare ind på Vinted.",
    knap: "Lav min annonce",
  },
  foerEfter: {
    foer: {
      label: "Før",
      tekst: "blå strik sælges, str m tror jeg, brugt men fin",
      pris: "100 kr. eller byd",
    },
    efter: {
      label: "Efter — med Fenja",
      titel: "Mørkeblå uldstrik · str. M",
      punkter: [
        "Rensede fotos, klar til Vinted",
        "Tøjet vist båret",
        "Fejl oplyst ærligt i teksten",
      ],
      pris: "Prisforslag: 120–160 kr.",
    },
    note: "Skitseret eksempel — ægte før/efter kommer, når appen er i drift.",
  },
  saadan: {
    titel: "Sådan virker det",
    trin: [
      {
        titel: "Fotografér",
        tekst: "Helhed, bagside, label og fejl. Dagslys er nok — resten klarer Fenja.",
      },
      {
        titel: "Fenja arbejder",
        tekst:
          "Cirka 90 sekunder: rensede billeder, tøjet vist båret og en tekst, der lyder som dig — ikke som en reklame.",
      },
      {
        titel: "Ind på Vinted",
        tekst: "Kopiér titel og tekst, hent billederne, læg annoncen op. Færdig.",
      },
    ],
  },
  aerlighed: {
    titel: "Ærlighed sælger",
    punkter: [
      "Dit eget foto står altid først — det er det, Vinted kræver, og det køberen stoler på.",
      "Visualiseringer i din leverance er mærkede, så ingen føler sig snydt — og din konto er aldrig i fare.",
      "Fejl og slid står i teksten. Det lyder farligt, men det er det modsatte: færre returkrav, bedre anmeldelser.",
    ],
  },
  laerTeaser: {
    titel: "Bliv skarpere til at sælge",
    tekst: "Korte guides om priser, fotos og sourcing — gratis, også uden konto.",
    alleGuides: "Alle guides",
  },
  cta: {
    titel: "Prøv med det næste stykke tøj, du vil sælge",
    knap: "Opret dig og lav din første annonce",
  },
} as const;
