// Copy til forsiden (Vinted-landingen — STRATEGISKIFT 2026-08-15: appen ER
// produktet udadtil). Manifest-reglerne gælder (HANDOFF §2.2.4): dansk,
// konkret, ærlig — tonen er direkte og ung; B2B-copy bor i da.landing (/studio).

export const vinted = {
  meta: {
    titel: "Selja til Vinted — færdig annonce på 2 minutter",
    beskrivelse:
      "Tag 2–4 mobilfotos af dit tøj. Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag — klar til at sætte ind på Vinted.",
  },
  hero: {
    maerkat: "Selja til Vinted",
    rubrik: "Din annonce. Færdig på 2 minutter.",
    tekst:
      "Tag 2–4 fotos med telefonen. Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag — du kopierer bare ind på Vinted.",
    knap: "Lav min annonce",
  },
  foerEfter: {
    foer: {
      label: "Før",
      tekst: "blå strik sælges, str m tror jeg, brugt men fin",
      pris: "100 kr. eller byd",
    },
    efter: {
      label: "Efter — med Selja",
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
        tekst: "Helhed, bagside, label og fejl. Dagslys er nok — resten klarer Selja.",
      },
      {
        titel: "Selja arbejder",
        tekst:
          "Cirka 90 sekunder: rensede billeder, tøjet vist båret og en tekst, der lyder som dig — ikke som en reklame.",
      },
      {
        titel: "Ind på Vinted",
        tekst: "Kopiér titel og tekst, hent billederne, læg annoncen op. Færdig.",
      },
    ],
  },
  // Midlertidig erstatning for Ærlighed-blokken (ejer-ordre 2026-08-15:
  // fjernet, sættes ind et andet sted senere) — leverancen som mørkt bånd.
  leverance: {
    titel: "Det får du",
    punkter: [
      "Rensede salgsfotos i Vinted-format — dine egne billeder, bare skarpere.",
      "Tøjet vist båret, så køberen kan se det på — ikke kun på bøjlen.",
      "Titel, beskrivelse og prisforslag, der lyder som dig — klar til at sætte ind.",
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
