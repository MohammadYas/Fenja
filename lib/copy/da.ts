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
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
    ikkeLoggetInd: "Du skal være logget ind for at se denne side.",
  },
} as const;

export type Copy = typeof da;
