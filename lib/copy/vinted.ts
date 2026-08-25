// Copy til forsiden (Vinted-landingen — STRATEGISKIFT 2026-08-15: appen ER
// produktet udadtil). Manifest-reglerne gælder (HANDOFF §2.2.4): dansk,
// konkret, ærlig — tonen er direkte og ung; B2B-copy bor i da.landing (/studio).

export const vinted = {
  meta: {
    titel: "Selja til Vinted: færdig annonce på cirka 2 minutter",
    beskrivelse:
      "Tag ét mobilfoto af dit tøj. Selja renser billedet, viser tøjet båret og skriver titel, beskrivelse og prisforslag. Klar til at sætte ind på Vinted.",
  },
  // Ejer-godkendt drømme-pivot 2026-08-20: drømmen er MULIGHEDEN (skabet er
  // penge værd) — aldrig et indtjeningsløfte. Funktionsløftet støtter under.
  hero: {
    rubrik: "Dit klædeskab er penge værd.",
    // Renset 21/8 (ejer: "det roder i toppen"): ét afsnit siger det hele —
    // tidsnoten er bagt ind, så heroen er rubrik → tekst → knap → friktion
    tekst:
      // Ejer-ordre 22/8: "tag ET billede", ikke 2–4 — og det er ærligt:
      // wizarden kræver kun helhedsfotoet, resten er valgfrit
      "Tag ét billede af dit tøj, så renser Selja det, viser tøjet båret og skriver titel, beskrivelse og prisforslag — selve annoncen tager cirka 2 minutter, når du er logget ind og har kreditter.",
    knap: "Lav din første annonce",
    friktion: "Uden binding · du betaler kun for leverede billeder · fejlede refunderes automatisk",
    // Gratis prøve uden konto (25/8): sekundær vej under hoved-CTA'en —
    // laveste tærskel for TikTok-trafikken
    provLink: "Eller prøv gratis med ét billede, helt uden konto",
  },
  // Drømme-regnestykket: ægte høst-medianer, tydeligt mærket regneeksempel
  skabRegner: {
    titel: "Hvad gemmer der sig i dit skab?",
    lead: "Træk i slideren — hvor mange stykker tøj bruger du aldrig?",
    antal: (n: number) => `${n} stykker tøj`,
    resultat: (kr: number) => `op til ~${kr.toLocaleString("da-DK")} kr.`,
    note: (median: number, dato: string) =>
      `Regneeksempel — ikke et løfte. Typisk midterpris ${median} kr. pr. stykke fra vores markedshøst ${dato}.`,
    knap: "Kom i gang nu",
  },
  mellemCta: "Lav din første annonce",
  stickyCta: "Lav min annonce",
  // Ejer-ordre 2026-08-20: flere valgbare før/efter-eksempler. Hvert par
  // viser SAMME stykke tøj (FØR = dårligt aftenfoto, EFTER = spejlselfie i
  // dagslys fra katalogserien).
  foerEfter: {
    foerLabel: "Før",
    efterLabel: "Efter · med Selja",
    vaelgerLabel: "Vælg eksempel",
    // Sleek AI-mærkning (MANGLER §4, EU AI-forordning art. 50): én stille
    // linje under panelet — samme greb som billedseriens note
    maerkat: "Eksempel: alle billeder er genereret med Selja.",
    punkter: [
      "Rensede fotos, klar til Vinted",
      "Tøjet vist båret",
      "Fejl oplyst ærligt i teksten",
    ],
    par: [
      // Ejer-ordre 22/8: cardigan-eksemplet står FØRST (og er dermed det
      // valgte standard-eksempel i panelet)
      {
        id: "cardigan",
        navn: "Cardigan",
        foerBillede: "/eksempler/katalog/p18-foer-cardigan.webp",
        foerAlt: "Sjusket aftenfoto af taupegrå cardigan smidt på en seng",
        foerTekst: "grå cardigan str s, næsten ikke brugt",
        foerPris: "60 kr.",
        efterBillede: "/eksempler/katalog/p2-entre-cardigan.webp",
        efterAlt: "Spejlselfie i dagslys med den taupegrå cardigan båret",
        efterTitel: "Taupegrå fintstrikket cardigan · str. S",
        efterPris: "Prisforslag: 140–200 kr.",
      },
      {
        id: "strik",
        navn: "Strik",
        foerBillede: "/eksempler/katalog/p13-foer-billede.webp",
        foerAlt: "Sjusket aftenfoto af mørkeblå striktrøje smidt på en seng",
        foerTekst: "blå strik sælges, str m tror jeg, brugt men fin",
        foerPris: "100 kr. eller byd",
        efterBillede: "/eksempler/katalog/p15-efter-spejl-strik.webp",
        efterAlt: "Spejlselfie i dagslys med den mørkeblå striktrøje båret",
        efterTitel: "Mørkeblå uldstrik · str. M",
        efterPris: "Prisforslag: 120–160 kr.",
      },
      {
        id: "kjole",
        navn: "Kjole",
        foerBillede: "/eksempler/katalog/p16-foer-kjole.webp",
        foerAlt: "Sjusket aftenfoto af salviegrøn kjole smidt på en seng",
        foerTekst: "grøn kjole str s, brugt få gange",
        foerPris: "150 kr.",
        efterBillede: "/eksempler/katalog/p4-sovevaerelse-kjole.webp",
        efterAlt: "Spejlselfie i dagslys med den salviegrønne midi-kjole båret",
        efterTitel: "Salviegrøn midi-kjole · str. S",
        efterPris: "Prisforslag: 190–270 kr.",
      },
      {
        id: "jeans",
        navn: "Jeans",
        foerBillede: "/eksempler/katalog/p17-foer-jeans.webp",
        foerAlt: "Sjusket aftenfoto af blå jeans smidt på en seng",
        foerTekst: "blå jeans w32, gode",
        foerPris: "80 kr.",
        // Ejer-ordre 20/8: jeans-eksemplet er en mand (p19)
        efterBillede: "/eksempler/katalog/p19-efter-jeans-mand.webp",
        efterAlt: "Spejlfoto i dagslys hvor en mand viser de mellemblå jeans båret",
        efterTitel: "Mellemblå straight-leg jeans · W32",
        efterPris: "Prisforslag: 100–150 kr.",
      },
    ],
  },
  billedserie: {
    titel: "Tøjet vist båret",
    // Ejer-ordre 2026-08-20: synlig note om at serien er genereret — det er
    // samtidig den AI-mærkning, lanceringen kræver (manifest §2.1.7/art. 50)
    note: "Alle billeder i serien er genereret med Selja.",
  },
  // Ejer-ordre 2026-08-20: anmeldelses-blok i heroen. Illustrative eksempler
  // på Vinted-sælgerprofiler — ingen navne, ingen Selja-påstand i teksten.
  anmeldelser: {
    label: "Anmeldelser på Vinted",
    medlemmer: "Medlemmer",
    automatiske: "Automatiske",
    // Ejeren bad om "det er fra vores brugere" — IKKE skrevet: tallene er
    // genererede eksempler, og der findes ingen brugere endnu (fabrikeret
    // proof ville være vildledende markedsføring). Ærlig formulering indtil
    // ægte bruger-anmeldelser findes; så kan linjen skiftes her.
    undertekst:
      "Sådan bedømmes sælgere på Vinted — gode billeder og ærlige annoncer er vejen til stjernerne.",
  },
  // Pris-transparens på forsiden (konvertering 22/8): pris-spørgsmålet er
  // en topindvending og blev først besvaret bag signup-væggen. Tallene kommer
  // fra lib/config (aldrig hårdkodet her). OBS: ingen nye tankestreger,
  // forsidens budget på 4 er brugt (marketing.test.tsx).
  pris: {
    titel: "Hvad koster det?",
    linje: (
      plusAntal: number,
      plusPris: number,
      proAntal: number,
      proPris: number,
    ) =>
      `Plus giver ${plusAntal} billeder for ${plusPris} kr. om måneden, Pro giver ${proAntal} for ${proPris} kr. Uden binding, opsig når som helst.`,
    knap: "Se alle priser",
  },
  // Ærligheds-blokken genplaceret (MANGLER §4; original fra 14/8 omskrevet
  // til Selja-æraen: ingen gratis-tier, mærkningen er de stille noter)
  aerlighed: {
    titel: "Ærlighed er hele idéen",
    tekst:
      "Vinted kræver, at billede 1 er dit eget foto af varen, og sådan leverer Selja det. Billeder med tøjet vist båret er genererede visualiseringer og står altid mærket som det, og oplyste fejl kommer med i beskrivelsen. Det beskytter din konto og dine handler.",
  },
  saadan: {
    titel: "Sådan virker det",
    trin: [
      {
        titel: "Fotografér",
        tekst: "Ét helhedsfoto i dagslys er nok. Bagside, label og fejl er valgfrit ekstra. Resten klarer Selja.",
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
    titel: "Det næste stykke tøj, du sælger, kan være klar om 2 minutter",
    kreditNote:
      "Du skal bruge kreditter for at lave en annonce. Vælg et abonnement, når du er klar — uden binding, opsig når som helst.",
    knap: "Opret dig og kom i gang",
  },
} as const;
