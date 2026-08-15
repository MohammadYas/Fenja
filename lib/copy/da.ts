// AL brugervendt tekst samles her (NFR-12) — aldrig hårdkodet i komponenter.
// Struktureret pr. flade, i18n-klar (NFR-13): en fremtidig en.ts spejler denne form.
// Copy-regler (HANDOFF §2.2.4): dansk, konkret, ærlig, lavmælt selvsikker; tal frem
// for tillægsord; knapper siger hvad de gør; fejl forklarer hvad man gør.

// Kreditsaldi kan indeholde halve (B-8) — dansk komma, aldrig "2.5"
const formaterKreditTal = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");

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
      antal === 1
        ? "1 annonce tilbage"
        : `${formaterKreditTal(antal)} annoncer tilbage`,
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
    sendLink: "Send mig et link",
    linkSendt: (email: string) =>
      `Vi har sendt et link til ${email}. Åbn mailen på denne telefon og tryk på linket.`,
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
      "Din konto mangler aldersbekræftelse. Log ud og ind igen for at bekræfte.",
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
    filterLabel: "Vis kun",
    filterAlle: "Alle",
    filterTom: "Ingen annoncer med den status endnu.",
    markerSolgt: "Markér som solgt",
    salgsprisLabel: "Salgspris i kr.",
    gemSalg: "Gem salget",
    statistikTitel: "Dine tal",
    solgteAntal: (antal: number) => (antal === 1 ? "1 solgt" : `${antal} solgte`),
    // Heltestallet i statistik-blokken: kæmpe mono-tal + denne linje under (REDESIGN §3.5)
    solgtMedFenja: "solgt med Fenja",
    liggetid: (dage: number) =>
      dage === 1 ? "1 dag i snit før salg" : `${dage} dage i snit før salg`,
  },
  regenerer: {
    titel: "Prøv igen med en anden del",
    forklaring: (pris: string) =>
      `Ny visualisering i et andet miljø eller en frisk annoncetekst — ${pris} pr. del. Dine rensede fotos er de samme.`,
    prisLabel: "½ kredit",
    nyVisualisering: "Ny visualisering",
    nyTekst: "Ny annoncetekst",
    presetLabel: "Miljø",
    koererVisualisering: "Syr en ny visualisering …",
    koererTekst: "Skriver en ny tekst …",
    faerdig: "Klar — siden er opdateret.",
    fejlGraense:
      "Du har brugt alle forsøg for denne del. Lav en ny annonce, hvis du vil videre.",
    fejlVisualisering:
      "Den nye visualisering ramte ikke kvalitetskravet, så vi leverer den ikke — og der er ikke trukket noget. Prøv et andet miljø.",
    fejlSaldo: "Du mangler kreditter til en regenerering. Køb en pakke under Kreditter.",
    fejlAlmen: "Noget gik galt undervejs. Der er ikke trukket noget — prøv igen.",
  },
  kreditter: {
    titel: "Kreditter",
    forklaring:
      "1 kredit = 1 færdig annonce. Kreditter trækkes først, når annoncen er leveret — fejler visualiseringen, får du kreditten tilbage.",
    saldoNu: (antal: number) => `Du har ${formaterKreditTal(antal)} tilbage.`,
    pakkeNavn: (antal: number) => `Fenja · ${antal} annoncer`,
    pakkeLinje: (antal: number, pris: number) => `${antal} annoncer · ${pris} kr.`,
    pakkeAntal: (antal: number) => `${antal} annoncer`,
    pakkePris: (pris: number) => `${pris} kr.`,
    prisPrStk: (kr: string) => `${kr} kr. pr. annonce`,
    koeb: "Køb",
    koebSucces: "Betalingen gik igennem. Kreditterne står på din saldo om et øjeblik.",
    koebAfbrudt: "Betalingen blev afbrudt. Der er ikke trukket noget.",
    betalingIkkeKlar:
      "Betaling er ikke sat op endnu. Skriv til os, hvis du ser denne besked på det rigtige site.",
    kvittering: "Du får kvittering på mail fra Stripe.",
  },
  fejlsider: {
    ikkeFundetKode: "404",
    ikkeFundetTitel: "Den side findes ikke",
    ikkeFundetTekst:
      "Linket kan være forkert, eller siden kan være fjernet. Forsiden er det bedste sted at starte forfra.",
    ikkeFundetKnap: "Til forsiden",
    fejlTitel: "Noget gik galt",
    fejlTekst:
      "Det er ikke dig — det er os. Prøv igen; hjælper det ikke, så vent et øjeblik og prøv en gang til.",
    fejlKnap: "Prøv igen",
  },
  priserSide: {
    titel: "Priser",
    lead: "3 annoncer gratis, når du opretter dig. Derefter køber du kun det, du bruger — ingen abonnement, intet der udløber.",
    stempel: "3 gratis annoncer",
    pakkerTitel: "Kreditpakker",
    saadanTitel: "Sådan virker kreditter",
    punkter: [
      {
        overskrift: "1 kredit = 1 færdig annonce",
        tekst: "Rensede billeder, mærket visualisering og annoncetekst — alt sammen for én kredit.",
      },
      {
        overskrift: "Du betaler først ved levering",
        tekst: "Kreditten trækkes, når annoncen er klar. Fejler visualiseringen, leverer vi resten og sætter kreditten tilbage automatisk.",
      },
      {
        overskrift: "Kreditter udløber ikke",
        tekst: "Køb en pakke i dag, brug den til foråret. Saldoen står, til du bruger den.",
      },
      {
        overskrift: "Priser er med moms",
        tekst: "Betaling sker via Stripe, som også sender din kvittering. Alle priser er i danske kroner og inklusive moms.",
      },
    ],
    faqTitel: "Spørgsmål, vi ofte får",
    faq: [
      {
        spoergsmaal: "Lægger Fenja annoncen op på Vinted for mig?",
        svar: "Nej. Fenja har ingen adgang til din Vinted-konto — det er en pointe, ikke en mangel. Du får billeder og tekst serveret, og kopierer selv ind. Det tager under et minut.",
      },
      {
        spoergsmaal: "Må jeg bruge visualiseringen som billede 1?",
        svar: "Nej. Vinted kræver, at billede 1 er dit eget foto af den faktiske vare. Visualiseringen er mærket og må kun bruges som supplement længere nede i annoncen.",
      },
      {
        spoergsmaal: "Hvor mange fotos skal jeg tage?",
        svar: "2–4 med din telefon: helhed (påkrævet), og gerne bagside, vaskemærke og eventuelle fejl. Dagslys og et roligt underlag er rigeligt.",
      },
      {
        spoergsmaal: "Hvad hvis jeg vil have en anden visualisering eller tekst?",
        svar: "Du kan regenerere en enkelt del — ny visualisering i et andet miljø eller en frisk tekst — for en halv kredit pr. del. Der trækkes kun, hvis den lykkes.",
      },
      {
        spoergsmaal: "Skal jeg have en adgangskode?",
        svar: "Nej. Du logger ind med et link, vi sender til din e-mail. Ingen adgangskode at glemme eller lække.",
      },
    ],
    ctaTitel: "Start med de tre gratis",
    ctaKnap: "Opret dig og få 3 gratis annoncer",
  },
  landing: {
    // Plakat-heroen (REDESIGN §3.1): ét ord pr. linje, sidste ord fremhævet i rav.
    heroPlakatLinjer: ["Sælg", "dit tøj"],
    heroPlakatFremhaevet: "hurtigere",
    heroStempel: "2 min",
    heroTitel: "Færdig Vinted-annonce på 2 minutter",
    heroTekst:
      "Tag et par mobilfotos af dit tøj. Fenja renser billederne, viser hvordan tøjet ser ud på, og skriver titel, beskrivelse og prisforslag — klar til at sætte ind på Vinted.",
    heroKnap: "Lav min annonce",
    heroFoer: "Dit foto",
    heroEfter: "Renset",
    // Før/efter-kortene (v3): annoncen som transformation — den sjuskede seddel
    // mod den færdige leverance. Skitseret eksempel, tydeligt mærket som sådan.
    foerKort: {
      label: "Før",
      tekst: "blå strik sælges, str m tror jeg, brugt men fin",
      pris: "100 kr. eller byd",
    },
    efterKort: {
      label: "Efter — med Fenja",
      titel: "Mørkeblå uldstrik · str. M",
      punkter: [
        "Rensede fotos, klar til Vinted",
        "Visualisering — altid mærket",
        "Fejl oplyst ærligt i teksten",
      ],
      pris: "Prisforslag: 120–160 kr.",
    },
    marginal: "Katalog 2026 · annoncer uden pynt",
    heroPladsholder:
      "Skitseret eksempel — når appen er i drift, viser vi et ægte før/efter herfra.",
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
    ctaLap: "3 gratis annoncer",
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
          "Din e-mail (til at logge ind og til beskeder om dine annoncer), dine billeder og annoncedata, din kredithistorik og tekniske logs om genereringer (status og omkostning), så tjenesten kan fungere og fejl kan findes.",
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
  laer: {
    titel: "Lær",
    forklaring:
      "Korte guides om at sælge brugt tøj: sourcing, priser, fotos og reglerne, der beskytter din konto. Gratis — også uden konto.",
    laesGuide: "Læs guiden",
    alleGuides: "Alle guides",
    forrigeGuide: "Forrige guide",
    naesteGuide: "Næste guide",
  },
  a11y: {
    springTilIndhold: "Spring til indholdet",
  },
  admin: {
    titel: "Drift",
    dagensForbrug: "Dagens API-forbrug (globalt loft)",
    loftNaaet: "Loftet er nået — nye pipelines afvises indtil midnat (UTC).",
    prDag: "Forbrug pr. dag (7 dage)",
    prBruger: "Forbrug pr. bruger (7 dage)",
    senesteGenereringer: "Seneste genereringer",
  },
  delebillede: {
    hent: "Hent før/efter-billede til deling",
    forklaring:
      "9:16-format klar til TikTok eller Instagram. Kun dine ægte fotos — du vælger selv, om og hvor du deler det.",
  },
  footer: {
    vilkaar: "Vilkår",
    privatliv: "Privatliv",
    produktGruppe: "Produkt",
    juraGruppe: "Det juridiske",
    maerkning:
      "Alle visualiseringer er mærket — synligt og i filens metadata. Det kræver loven, og det er kun rimeligt.",
  },
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
    ikkeLoggetInd: "Du skal være logget ind for at se denne side.",
  },
} as const;

export type Copy = typeof da;
