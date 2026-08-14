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
  oversigt: {
    titel: "Oversigt",
    tom: "Ingen items endnu. Start med dit første — det tager cirka 2 minutter.",
    foersteKnap: "Lav min første annonce",
    status: {
      draft: "Kladde",
      active: "Aktiv",
      sold: "Solgt",
    },
    markerSolgt: "Markér som solgt",
    salgsprisLabel: "Salgspris i kr.",
    gemSalg: "Gem salget",
    statistikTitel: "Dine tal",
    solgteAntal: (antal: number) => (antal === 1 ? "1 solgt" : `${antal} solgte`),
    samletVaerdi: (kr: number) => `Solgt for ${kr} kr. med Fenja`,
    liggetid: (dage: number) =>
      dage === 1 ? "1 dag i snit før salg" : `${dage} dage i snit før salg`,
  },
  kreditter: {
    titel: "Kreditter",
    forklaring:
      "1 kredit = 1 færdig annonce. Kreditter trækkes først, når annoncen er leveret — fejler visualiseringen, får du kreditten tilbage.",
    saldoNu: (antal: number) => `Du har ${antal} tilbage.`,
    pakkeNavn: (antal: number) => `Fenja · ${antal} annoncer`,
    pakkeLinje: (antal: number, pris: number) => `${antal} annoncer · ${pris} kr.`,
    prisPrStk: (kr: string) => `${kr} kr. pr. annonce`,
    koeb: "Køb",
    koebSucces: "Betalingen gik igennem. Kreditterne står på din saldo om et øjeblik.",
    koebAfbrudt: "Betalingen blev afbrudt. Der er ikke trukket noget.",
    betalingIkkeKlar:
      "Betaling er ikke sat op endnu. Skriv til os, hvis du ser denne besked på det rigtige site.",
    kvittering: "Du får kvittering på mail fra Stripe.",
  },
  landing: {
    heroTitel: "Færdig Vinted-annonce på 2 minutter",
    heroTekst:
      "Tag et par mobilfotos af dit tøj. Fenja renser billederne, viser hvordan tøjet ser ud på, og skriver titel, beskrivelse og prisforslag — klar til at sætte ind på Vinted.",
    heroKnap: "Lav min annonce",
    heroFoer: "Dit foto",
    heroEfter: "Renset",
    heroPladsholder:
      "Her kommer et ægte før/efter fra appen — vi bruger ikke opstillede eksempler.",
    saadanTitel: "Sådan virker det",
    saadanTrin: [
      {
        titel: "Fotografér",
        tekst: "2–4 fotos med telefonen: helhed, bagside, label og eventuelle fejl.",
      },
      {
        titel: "Fenja arbejder",
        tekst: "Billederne renses, en mærket visualisering laves, og annonceteksten skrives — på cirka 90 sekunder.",
      },
      {
        titel: "Sæt ind på Vinted",
        tekst: "Kopiér titel og beskrivelse, hent billederne, og læg annoncen op. Fejl og slid står ærligt i teksten.",
      },
    ],
    aerligTitel: "Ærlighed er hele idéen",
    aerligTekst:
      "Vinted kræver, at billede 1 er dit eget foto af varen — sådan leverer Fenja det. Visualiseringer er tydeligt mærket, og oplyste fejl kommer altid med i beskrivelsen. Det beskytter din konto og dine handler.",
    priserTitel: "Priser",
    priserGratis: "3 annoncer gratis, når du opretter dig.",
    priserDerefter: "Derefter:",
    ctaTitel: "Prøv med det næste stykke tøj, du vil sælge",
    ctaKnap: "Opret dig og få 3 gratis annoncer",
  },
  vilkaar: {
    titel: "Vilkår",
    opdateret: "Senest opdateret: 14. august 2026",
    afsnit: [
      {
        overskrift: "Hvad Fenja er",
        tekst: [
          "Fenja hjælper dig med at lave annoncer til dit brugte tøj: rensede billeder, en tydeligt mærket visualisering og en færdig annoncetekst. Du lægger selv annoncen på Vinted — Fenja har ingen adgang til din Vinted-konto.",
        ],
      },
      {
        overskrift: "Krav til dig",
        tekst: [
          "Du skal være mindst 18 år for at bruge Fenja — det er også Vinteds egen aldersgrænse.",
          "Du må kun uploade billeder af tøj, du selv ejer og har ret til at sælge, og du er ansvarlig for indholdet af de annoncer, du lægger op.",
          "Fenja er lavet til privat salg af brugt tøj. Brug ikke Fenja til kommercielt salg på en privat Vinted-konto — det er brud på Vinteds vilkår og kan koste dig kontoen.",
        ],
      },
      {
        overskrift: "Visualiseringer",
        tekst: [
          "Visualiseringer er genererede billeder og er altid mærket synligt og i filens metadata, som EU-reglerne kræver. Brug altid dit eget, ægte foto som billede 1 på Vinted, og brug kun visualiseringen som supplement.",
          "Prisforslag er forslag, ikke garantier. Du bestemmer selv din pris.",
        ],
      },
      {
        overskrift: "Kreditter og betaling",
        tekst: [
          "1 kredit svarer til 1 leveret annonce. Kreditter trækkes først, når leverancen er færdig. Fejler visualiseringen, leverer vi resten og sætter kreditten for visualiseringen tilbage automatisk.",
          "Betaling sker via Stripe, som også sender din kvittering. Priserne er i danske kroner og inklusive moms. Købte kreditter udløber ikke.",
        ],
      },
      {
        overskrift: "Ansvar",
        tekst: [
          "Fenja leverer værktøjet — selve handlen er mellem dig og din køber. Vi kan ikke garantere, at dit tøj bliver solgt, og vi er ikke part i dine handler på Vinted.",
          "Vinteds regler ændrer sig løbende. Fenja følger dem — det bør du også.",
        ],
      },
      {
        overskrift: "Ophør",
        tekst: [
          "Du kan slette din konto når som helst under Konto. Så sletter vi alle dine billeder og data inden for 24 timer.",
        ],
      },
    ],
  },
  privatliv: {
    titel: "Privatliv",
    opdateret: "Senest opdateret: 14. august 2026",
    afsnit: [
      {
        overskrift: "Kort version",
        tekst: [
          "Dine billeder bruges kun til at lave din egen annonce. Vi træner ikke modeller på dem, vi deler dem ikke, og vi sælger ingen data. Sletter du din konto, sletter vi alt inden for 24 timer.",
        ],
      },
      {
        overskrift: "Hvad vi gemmer",
        tekst: [
          "Din e-mail (til login og beskeder om dine annoncer), dine billeder og annoncedata, din kredithistorik og tekniske logs om genereringer (status og omkostning), så tjenesten kan fungere og fejl kan findes.",
          "Betalingsoplysninger håndteres af Stripe — vi ser aldrig dit kortnummer.",
        ],
      },
      {
        overskrift: "Hvor det ligger",
        tekst: [
          "Data ligger hos vores databehandlere: Supabase (database og billeder, privat lager med signerede links), Stripe (betaling), Resend (mails) samt de billed- og tekstmodeller, der laver din leverance. Billeder sendes kun til modellerne for at lave netop din annonce.",
        ],
      },
      {
        overskrift: "Dine rettigheder",
        tekst: [
          "Du kan få indsigt i, rette eller slette dine data. Sletning klarer du selv under Konto — alt fjernes inden for 24 timer. Vil du klage, kan du kontakte Datatilsynet.",
        ],
      },
    ],
  },
  footer: {
    vilkaar: "Vilkår",
    privatliv: "Privatliv",
  },
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
    ikkeLoggetInd: "Du skal være logget ind for at se denne side.",
  },
} as const;

export type Copy = typeof da;
