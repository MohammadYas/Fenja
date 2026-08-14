// AL brugervendt tekst samles her (NFR-12) — aldrig hårdkodet i komponenter.
// Struktureret pr. flade, i18n-klar (NFR-13): en fremtidig en.ts spejler denne form.
// Copy-regler (HANDOFF §2.2.4): dansk, konkret, ærlig, lavmælt selvsikker; tal frem
// for tillægsord; knapper siger hvad de gør; fejl forklarer hvad man gør.

export const da = {
  site: {
    navn: "Fenja",
    beskrivelse:
      "Upload mobilfotos af dit tøj og få rensede salgsbilleder, en mærket visualisering og en færdig annoncetekst — klar til Vinted.",
  },
  nav: {
    oversigt: "Oversigt",
    nytItem: "Nyt item",
    saadanVirkerDet: "Sådan virker det",
    priser: "Priser",
    laer: "Lær",
    kreditter: "Kreditter",
    konto: "Konto",
    logInd: "Log ind",
    logUd: "Log ud",
    saldo: (antal: number) =>
      antal === 1 ? "1 annonce tilbage" : `${antal} annoncer tilbage`,
  },
  logInd: {
    titel: "Log ind",
    forklaring:
      "Skriv din e-mail, så sender vi et link, der logger dig ind. Ingen adgangskode.",
    emailLabel: "E-mail",
    alderSpoergsmaal: "Er du 18 år eller ældre?",
    alderJa: "Ja, jeg er 18 år eller ældre",
    alderNej: "Nej, jeg er under 18",
    alderHjaelp: "Vinted kræver, at sælgere er myndige — det gør vi også.",
    sendLink: "Send login-link",
    linkSendt: (email: string) =>
      `Vi har sendt et login-link til ${email}. Åbn mailen på denne telefon og tryk på linket.`,
    under18:
      "Fenja er for sælgere på 18 år eller derover, fordi Vinted kræver det. Du er velkommen tilbage, når du er fyldt 18.",
    alderPaakraevet: "Bekræft at du er 18 år eller ældre for at fortsætte.",
    fejl: "Linket kunne ikke sendes. Tjek at e-mailen er rigtig, og prøv igen.",
  },
  konto: {
    titel: "Konto",
    emailLabel: "E-mail",
    saldoLabel: "Kreditsaldo",
    koebshistorik: "Købshistorik",
    ingenKoeb: "Ingen køb endnu. Dine 3 gratis annoncer fulgte med, da du oprettede dig.",
    koebLinje: (antal: number, dato: string) => `${antal} kreditter · ${dato}`,
    sletKonto: "Slet min konto",
    sletForklaring:
      "Sletter din konto, alle billeder og alle data inden for 24 timer. Det kan ikke fortrydes.",
    sletBekraeft: "Skriv SLET for at bekræfte",
    sletBekraeftOrd: "SLET",
    sletEndeligt: "Slet alt permanent",
    sletFejl: "Kontoen kunne ikke slettes. Prøv igen, eller skriv til os hvis det fortsætter.",
    kraevAldersbekraeftelse:
      "Din konto mangler alders-bekræftelse. Log ud og ind igen for at bekræfte.",
  },
  nytItem: {
    titel: "Nyt item",
    forklaring:
      "Tag 2–4 fotos, udfyld 4 felter, og få en færdig annonce på cirka 2 minutter.",
    fotoTitel: "Fotos",
    roller: {
      full: {
        navn: "Helhed",
        hjaelp: "Hele tøjet på et jævnt underlag eller en bøjle. Det bliver billede 1 på Vinted.",
        paakraevet: true,
      },
      back: { navn: "Bagside", hjaelp: "Bagsiden af tøjet.", paakraevet: false },
      label: {
        navn: "Label",
        hjaelp: "Vaskemærket — så aflæser vi materiale og vask for dig.",
        paakraevet: false,
      },
      defect: {
        navn: "Fejl",
        hjaelp: "Tæt på slid, pletter eller huller. Ærlighed sælger — og beskytter dig mod reklamationer.",
        paakraevet: false,
      },
    },
    tagFoto: "Tag eller vælg foto",
    skiftFoto: "Skift foto",
    komprimerer: "Gør fotoet klar …",
    felterTitel: "Om tøjet",
    maerkeLabel: "Mærke",
    stoerrelseLabel: "Størrelse",
    standLabel: "Stand",
    standVaelg: "Vælg stand",
    kategoriLabel: "Kategori",
    kategoriHjaelp: "Fx striktrøje, kjole, jeans, jakke",
    fejlLabel: "Fejl eller slid",
    fejlHjaelp:
      "Beskriv ærligt — det SKAL med i annoncen. Uoplyste fejl giver køber ret til at returnere.",
    koebsprisLabel: "Købspris (valgfri)",
    koebsprisHjaelp: "Hjælper prisforslaget. Kun tal i kroner.",
    lavAnnonce: "Lav min annonce",
    uploader: "Uploader fotos …",
    fejlHelhedMangler: "Der mangler et helhedsfoto — det er det, Vinted kræver som billede 1.",
    fejlFelterMangler: "Udfyld mærke, størrelse, stand og kategori.",
    fejlIngenKreditter: "Du har ingen kreditter tilbage. Køb en pakke under Kreditter.",
    fejlRateLimit: "Du har nået dagens grænse for nye annoncer. Prøv igen i morgen.",
    fejlUpload: "Et foto kunne ikke uploades. Tjek forbindelsen og prøv igen.",
  },
  resultat: {
    titelArbejder: "Din annonce er på vej",
    trin: {
      cleanup: "Renser billeder",
      onmodel: "Laver visualisering",
      text: "Skriver annoncetekst",
    },
    trinVenter: "venter",
    trinIGang: "i gang",
    trinFaerdig: "færdig",
    trinFejlet: "sprang over",
    aegteFotosTitel: "Dine rensede fotos",
    aegteFotosInstruks:
      "Brug dette som billede 1 på Vinted. Vinted kræver, at første foto viser hele den faktiske vare, taget af dig.",
    downloadFoto: "Hent foto",
    visualiseringTitel: "Visualisering",
    visualiseringForklaring:
      "Sådan kan tøjet se ud på. Billedet er genereret ud fra dit foto og mærket som visualisering — brug det som supplement, aldrig som billede 1.",
    visualiseringBadge: "Visualisering",
    visualiseringFejlede:
      "Visualiseringen ramte ikke vores kvalitetskrav denne gang, så vi leverer den ikke — og kreditten for den er sat tilbage. Dine rensede fotos og annonceteksten er klar herunder.",
    tekstTitel: "Annoncetekst",
    titelLabel: "Titel",
    beskrivelseLabel: "Beskrivelse",
    soegeordLabel: "Søgeord",
    prisLabel: "Prisforslag",
    prisVisning: (fra: number, til: number) => `${fra}–${til} kr.`,
    kopier: "Kopiér",
    kopieret: "Kopieret",
    checklisteTitel: "Sådan lægger du den på Vinted",
    checkliste: [
      "Åbn Vinted og tryk på Sælg.",
      "Upload det rensede helhedsfoto som billede 1, og de øvrige fotos efter.",
      "Tilføj eventuelt visualiseringen til sidst — aldrig som første billede.",
      "Kopiér titel og beskrivelse ind fra Fenja.",
      "Sæt prisen ud fra prisforslaget, og justér efter din tidshorisont.",
      "Tjek at fejl og slid står i beskrivelsen, og send annoncen af sted.",
    ],
    vintedDisclaimer:
      "Vinteds regler ændrer sig — Fenja følger dem, det bør du også.",
    vintedReglerLink: "Læs Vinteds katalogregler",
    ikkeFundet: "Vi kan ikke finde den annonce. Gå til oversigten og prøv derfra.",
  },
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
    ikkeLoggetInd: "Du skal være logget ind for at se denne side.",
  },
} as const;

export type Copy = typeof da;
