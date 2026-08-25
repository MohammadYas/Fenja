// AL brugervendt tekst samles her (NFR-12) — aldrig hårdkodet i komponenter.
// Struktureret pr. flade, i18n-klar (NFR-13): en fremtidig en.ts spejler denne form.
// Copy-regler (HANDOFF §2.2.4): dansk, konkret, ærlig, lavmælt selvsikker; tal frem
// for tillægsord; knapper siger hvad de gør; fejl forklarer hvad man gør.

// Kreditsaldi kan indeholde halve (B-8) — dansk komma, aldrig "2.5"
const formaterKreditTal = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");

export const da = {
  site: {
    navn: "Selja",
    beskrivelse:
      "Tag 2–4 mobilfotos af dit tøj — Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag, klar til Vinted.",
  },
  nav: {
    virksomheder: "Til virksomheder",
    oversigt: "Oversigt",
    nytItem: "Nyt item",
    saadanVirkerDet: "Sådan virker det",
    priser: "Priser",
    laer: "Lær",
    kreditter: "Kreditter",
    konto: "Konto",
    logInd: "Log ind",
    logUd: "Log ud",
    indlaeser: "Indlæser …",
    // Ejer-ordre 2026-08-20: tælleordet er kreditter, ikke annoncer
    saldo: (antal: number) =>
      antal === 1
        ? "1 kredit tilbage"
        : `${formaterKreditTal(antal)} kreditter tilbage`,
  },
  logInd: {
    titel: "Log ind eller opret dig",
    loginFane: "Log ind",
    signupFane: "Opret konto",
    forklaringLogin: "Skriv din e-mail og adgangskode.",
    forklaringSignup:
      "Vælg en e-mail og en adgangskode på mindst 8 tegn. Du får et bekræftelseslink på mail — så er du i gang.",
    emailLabel: "E-mail",
    adgangskodeLabel: "Adgangskode",
    adgangskodeHjaelp: "Mindst 8 tegn.",
    alderSpoergsmaal: "Er du 18 år eller ældre?",
    alderJa: "Ja, jeg er 18 år eller ældre",
    alderNej: "Nej, jeg er under 18",
    alderHjaelp: "Vinted kræver, at sælgere er myndige — det gør vi også.",
    logIndKnap: "Log ind",
    opretKnap: "Opret konto",
    // Glemt adgangskode (S39, bygget 21/8 — Resend-SMTP gjorde det muligt)
    glemt: {
      knap: "Glemt din adgangskode?",
      emailFoerst: "Skriv din e-mail i feltet ovenfor først.",
      sendt: "Hvis adressen har en konto, har vi sendt et link til at vælge en ny adgangskode. Kig også i spam.",
    },
    under18:
      "Selja er for sælgere på 18 år eller derover, fordi Vinted kræver det. Du er velkommen tilbage, når du er fyldt 18.",
    alderPaakraevet: "Bekræft at du er 18 år eller ældre for at fortsætte.",
    // E-mail-bekræftelse (sikkerhed 21/8): ingen adgang før linket er fulgt.
    // Samme besked uanset om adressen findes i forvejen — ellers kan man
    // aflure hvilke e-mails der har en konto.
    bekraeftMail: {
      titel: "Tjek din indbakke",
      brod: (email: string) =>
        `Vi har sendt et bekræftelseslink til ${email}. Tryk på linket, så er din konto klar.`,
      spam: "Ingen mail? Kig i spam, eller prøv igen om et øjeblik.",
      // Ejer-ordre 22/8: siden venter selv — tjekker løbende og sender videre,
      // og en knap til den utålmodige, der lige HAR klikket på linket
      autoTjek:
        "Du kan blive på denne side: vi tjekker selv løbende og sender dig videre, så snart du har bekræftet.",
      knap: "Jeg har bekræftet",
      ikkeEndnu:
        "Vi kan ikke se bekræftelsen endnu. Vent et øjeblik, efter du har trykket på linket i mailen, og prøv igen.",
      sendIgen: "Send mailen igen",
      sendtIgen: "Vi har sendt en ny mail. Kig i indbakken om et øjeblik.",
      sendIgenFejl:
        "Vi kunne ikke sende en ny mail lige nu. Vent et minut, og prøv igen.",
    },
    // Mail-link der ikke kunne bruges (udløbet, brugt, eller åbnet af mail-
    // programmets linkscanner før dig). Ærlig forklaring i stedet for en tom
    // login-væg — er kontoen allerede bekræftet, virker login med det samme.
    linkUdloebet:
      "Linket fra mailen er udløbet eller allerede brugt. Log ind herunder: er din konto allerede bekræftet, virker det med det samme, og ellers sender vi dig en frisk mail.",
    fejlLogin: "Forkert e-mail eller adgangskode. Prøv igen.",
    fejlSignup:
      "Kontoen kunne ikke oprettes. Måske findes e-mailen allerede — prøv at logge ind i stedet.",
    fejlKortKode: "Adgangskoden skal være mindst 8 tegn.",
    fejlGenerel: "Noget gik galt. Tjek forbindelsen og prøv igen.",
    // Social login (ejer-ordre 2026-08-20): Google ved siden af e-mail.
    // Apple er fravalgt — det kræver betalt Apple Developer-medlemskab.
    ellers: "eller",
    google: "Fortsæt med Google",
    socialAlderFoerst:
      "Bekræft først, at du er 18 år eller ældre — så kan du fortsætte med Google.",
    fejlSocial:
      "Log ind med den tjeneste kunne ikke starte. Prøv igen, eller brug e-mail og adgangskode.",
  },
  // Ny adgangskode-siden (S39): landing fra nulstillings-mailen
  nyAdgangskode: {
    titel: "Vælg ny adgangskode",
    forklaring: "Skriv din nye adgangskode — så er du logget ind med det samme.",
    knap: "Gem ny adgangskode",
    ingenSession:
      "Linket er udløbet eller allerede brugt. Bed om et nyt fra log ind-siden.",
    tilLogInd: "Til log ind-siden",
    fejl: "Adgangskoden kunne ikke gemmes. Prøv igen.",
  },
  // Feedback (ejer-ordre 21/8): kort formular på Konto, læses i admin
  feedback: {
    titel: "Ris, ros og idéer",
    forklaring:
      "Fandt du en fejl, eller mangler der noget? Skriv det her — vi læser det hele.",
    kategoriLabel: "Hvad handler det om?",
    kategorier: {
      ros: "Ros",
      fejl: "Fejl",
      forslag: "Forslag",
      andet: "Andet",
    } as Record<string, string>,
    beskedLabel: "Din besked",
    beskedPladsholder: "Skriv kort og konkret — gerne med et eksempel.",
    knap: "Send feedback",
    tak: "Tak — vi har modtaget din besked og læser den snarest.",
    fejlKategori: "Vælg hvad beskeden handler om.",
    fejlBesked: "Skriv en besked på mellem 3 og 2000 tegn.",
    fejlLoft: "Du har sendt meget feedback i dag — prøv igen i morgen.",
  },
  // Bundle-bygger (kun Pro, 21/8 nat)
  bundleBygger: {
    titel: "Bundle-bygger",
    stempel: "Kun Pro",
    forklaring:
      "Vælg 2-4 aktive annoncer og få én samlet pakke-annonce med skarp pakkepris — pakker sælger flere stykker på én forsendelse.",
    knap: (antal: number) => (antal < 2 ? "Vælg mindst 2" : `Byg pakke af ${antal}`),
    forFaa: "Du skal have mindst to aktive annoncer for at bygge en pakke.",
    prisLinje: (foer: number, nu: number) =>
      `Samlet værdi ${foer} kr. → pakkepris ${nu} kr.`,
    kopierTitel: "Kopiér titel",
    kopierBeskrivelse: "Kopiér beskrivelse",
    kopieret: "Kopieret ✓",
    kunPro: "Bundle-byggeren er en Pro-funktion — opgradér på kreditsiden.",
    fejlAntal: "Vælg mellem 2 og 4 annoncer.",
    fejlItems:
      "En eller flere af annoncerne kunne ikke bruges — de skal være aktive og dine.",
    fejlPris: "Annoncerne mangler prisforslag — pakkeprisen kan ikke regnes.",
    fejlLoft: "Du har bygget mange pakker i dag — prøv igen i morgen.",
  },
  // Kontakt (ejer-ordre 21/8 nat): offentlig /kontakt + sektion på Konto
  kontaktSide: {
    titel: "Kontakt",
    metaBeskrivelse:
      "Skriv til Selja — spørgsmål, fejl eller idéer. Vi svarer hurtigst muligt.",
    forklaring:
      "Spørgsmål, problemer eller bare en tanke? Skriv her, så svarer vi på din e-mail hurtigst muligt.",
    navnLabel: "Dit navn",
    emailLabel: "Din e-mail",
    beskedLabel: "Din besked",
    beskedPladsholder: "Skriv hvad det drejer sig om — gerne med detaljer.",
    knap: "Send besked",
    tak: "Tak for din besked — vi svarer på din e-mail hurtigst muligt.",
    skrivIgen: "Skriv en besked mere",
    fejlNavn: "Skriv dit navn.",
    fejlEmail: "Skriv en rigtig e-mailadresse — det er dér, vi svarer.",
    fejlBesked: "Skriv en besked på mellem 3 og 4000 tegn.",
    fejlLoft: "Du har sendt flere beskeder i dag — vi vender tilbage på dem først.",
  },
  konto: {
    titel: "Konto",
    emailLabel: "E-mail",
    saldoLabel: "Kreditsaldo",
    koebshistorik: "Købshistorik",
    ingenKoeb: "Ingen køb endnu. Vælg et abonnement under Kreditter, når du er klar.",
    koebLinje: (antal: number, dato: string) => `${antal} kreditter · ${dato}`,
    abonnementLinje: (antal: number, dato: string) =>
      `${antal} kreditter fra abonnement · ${dato}`,
    // Ejer-ordre 2026-08-20: personen på billederne skal kunne ændres her —
    // bag en knap og med en bekræftelse, så et fejlklik ikke skifter alle
    // kommende billeder.
    koen: {
      titel: "Personen på dine billeder",
      forklaring:
        "Billederne genereres med en anonym person, der ligner dig. Ansigtet er altid skjult. Ændrer du valget, gælder det fra din næste annonce — færdige billeder er uændrede.",
      nuvaerende: (koen: string, haar: string | null) =>
        haar ? `Nu: ${koen} · ${haar} hår` : `Nu: ${koen}`,
      ingenValgt: "Ikke valgt endnu",
      aendreKnap: "Ændre køn",
      gemKnap: "Gem ændring",
      annuller: "Fortryd",
      bekraeftTekst: (koen: string) =>
        `Skift personen på dine billeder til ${koen.toLowerCase()}? Det gælder alle annoncer, du laver fremover.`,
      bekraeftKnap: "Ja, skift køn",
      gemt: "Gemt",
      fejl: "Valget kunne ikke gemmes. Prøv igen.",
    },
    // S31 · dit faste hjem på visualiseringerne. Alle dine annoncer optages i
    // samme bolig, så profilen ligner ét sted — du kan vælge hvilket.
    hjem: {
      titel: "Dit hjem på billederne",
      forklaring:
        "Alle dine visualiseringer optages samme sted, så din profil ligner ét hjem og ikke tusind tilfældige baggrunde. Stedet er dit alene — ingen anden sælger får det. Passer det slet ikke til dig, kan du skifte op til tre gange.",
      ditHjem: "Dit hjem",
      nuvaerende: (navn: string) => `Nu: ${navn}`,
      tilbage: (antal: number) =>
        antal === 1
          ? "Du har 1 skift tilbage."
          : `Du har ${antal} skift tilbage.`,
      opbrugt: (_maks?: number) =>
        "Du har brugt alle dine skift — hjemmet er nu fast, så dine annoncer bliver ved med at ligne det samme sted.",
      altOptaget: "Alle hjem er optaget lige nu — dit nuværende beholdes.",
      skiftet: "Du har fået et nyt sted. Det gælder fra din næste annonce — færdige billeder er uændrede.",
      roterKnap: "Skift til et andet hjem",
      bekraeftTekst: (tilbage: number) =>
        tilbage === 1
          ? "Dette er dit sidste skift. Nye annoncer optages i det nye hjem; færdige billeder er uændrede."
          : `Skift hjem? Du har ${tilbage} skift tilbage. Nye annoncer optages i det nye hjem; færdige billeder er uændrede.`,
      bekraeftKnap: "Ja, skift hjem",
      fortryd: "Fortryd",
      gemt: "Gemt",
      fejl: "Hjemmet kunne ikke skiftes. Prøv igen.",
      navne: {
        "vesterbro-lejlighed": "Lys lejlighed",
        "aarhus-raekkehus": "Rækkehus",
        "noerrebro-vaerelse": "Værelse i delelejlighed",
        "odense-villa": "Villa med have",
        "aalborg-nybyg": "Nyt byggeri",
      } as Record<string, string>,
    },
    // GDPR art. 15 + 20: indsigt og dataportabilitet som selvbetjening.
    // Teksterne i omEksporten lægges ind i selve filen, så den kan forstås
    // uden at have appen ved hånden (art. 12).
    data: {
      titel: "Dine data",
      forklaring:
        "Hent alt, vi har registreret om dig: din konto, dine annoncer med billedlinks og hele din kredithistorik. Filen er JSON — den kan læses som tekst og indlæses i andre programmer.",
      hent: "Hent mine data",
      billedlinkNote:
        "Billedlinkene i filen virker i én time. Gem billederne med det samme, hvis du vil beholde dem.",
      omEksporten: [
        "Dette er dine data fra Selja.",
        "Filen er lavet, fordi du selv bad om den under Konto. Den indeholder din konto, dine annoncer og din kredithistorik.",
        "Billedlinkene er midlertidige og virker i én time fra det tidspunkt, der står i feltet 'eksporteret'.",
        "Bilag for dine køb ligger hos Stripe og i vores regnskab, fordi bogføringsloven kræver 5 års opbevaring — de er derfor ikke med her.",
        "Spørgsmål til dine data: visual.studio.tuturials@gmail.com",
      ],
      fejl: "Udtrækket kunne ikke laves. Prøv igen, eller skriv til os hvis det fortsætter.",
    },
    sletKonto: "Slet min konto",
    sletForklaring:
      "Sletter din konto, alle billeder og annoncedata inden for 24 timer, og stopper et eventuelt abonnement. Det kan ikke fortrydes. Bilag for dine køb gemmes i 5 år (bogføringsloven).",
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
    // Wizard (ejer-ordre 2026-08-20: flere sider, tøjdel vælges først)
    trinAf: (n: number, total: number) => `Trin ${n} af ${total}`,
    tilbage: "Tilbage",
    naeste: "Næste",
    delTitel: "Hvad sælger du?",
    delHjaelp: "Vælg typen — så rammer billeder og tekst rigtigt fra start.",
    dele: [
      "Jeans",
      "Bukser",
      "Shorts",
      "Top & bluse",
      "T-shirt",
      "Striktrøje",
      "Hoodie & sweatshirt",
      "Skjorte",
      "Kjole",
      "Nederdel",
      "Jakke & frakke",
      "Taske",
      "Andet",
    ],
    // Ejer-ordre 20/8: label og farve skrives (AI læser ikke label-fotos).
    // Ejer-ordre 20/8 (senere): farve, størrelse og stand følger Vinteds
    // egne lister 1:1, så annoncen kan sættes direkte ind.
    farveLabel: "Farve",
    farveHjaelp: "Vælg op til 2 af Vinteds farver.",
    farveVisAlle: "Vis alle farver",
    farveVisFaerre: "Vis færre farver",
    labelTekstLabel: "Fra vaskemærket",
    labelTekstHjaelp:
      "Skriv materiale og evt. vask, fx \"100 % uld, vask ved 30°\". Valgfrit.",
    opsummeringTitel: "Tjek og send",
    opsummeringHjaelp:
      "Et hurtigt kig, før Selja går i gang — kreditterne trækkes, når du trykker, og fejlede billeder refunderes automatisk.",
    fotoTitel: "Fotos",
    // Ejer-ordre 20/8: det skal være TYDELIGT at kun helhedsfotoet kræves
    fotoTitelHjaelp:
      "Kun helhedsfotoet skal med. Bagsiden er valgfri og kan gøre annoncen bedre.",
    fotoSkalMed: "Skal med",
    fotoValgfrit: "Valgfrit",
    // Opsummeringen (ejer-ordre 20/8): navngiv de angivne fotos
    fotoAngivet: (navne: string[]) =>
      navne.length === 0 ? "Intet foto angivet" : `Angivet: ${navne.join(" + ")}`,
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
    maerkeLabel: "Varemærke",
    // Ejer-ordre 20/8: det skal være TYDELIGT at man bare kan skrive selv
    maerkeHjaelp:
      "Skriv mærket selv — forslagene er kun en genvej, du behøver ikke vælge fra listen.",
    maerkePlaceholder: "Fx Zara, Ganni eller et mærke, vi ikke kender",
    maerkeIngenMatch: "Helt fint — vi bruger mærket, præcis som du skriver det.",
    stoerrelseLabel: "Størrelse",
    stoerrelseVaelg: "Vælg størrelse",
    standLabel: "Artiklens stand",
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
    fejlIngenKreditter:
      "Du har ingen kreditter tilbage. Fyld op eller vælg et abonnement under Kreditter.",
    koebKreditterKnap: "Vælg abonnement og fortsæt",
    fejlRateLimit: "Du har nået dagens grænse for nye annoncer. Prøv igen i morgen.",
    fejlUpload: "Et foto kunne ikke uploades. Tjek forbindelsen og prøv igen.",
    // Bulletproof kladde (ejer-ordre 20/8)
    kladdeGendannet:
      "Din kladde er gendannet — felter og fotos er gemt på telefonen, indtil annoncen er oprettet.",
    fejlOffline:
      "Ingen forbindelse lige nu. Alt er gemt på telefonen — prøv igen om lidt.",
    // Ejer-ordre 20/8: brugeren vælger selv hvilke billeder der genereres —
    // med eksempler, tydelig pris og en eksplicit opret-knap (ingen auto-start)
    visningTitel: "Hvilke billeder skal laves?",
    visningHjaelp:
      "Vælg et eller flere. 1 kredit pr. billede — trækkes når du sætter i gang, og fejlede billeder refunderes automatisk. Eksemplerne viser stilen; dit eget tøj og foto styrer resultatet.",
    visningEksempelAlt: (navn: string) =>
      `Eksempel på "${navn}" — genereret med Selja`,
    visningAntal: (n: number) =>
      n === 1 ? "1 billede · 1 kredit" : `${n} billeder · ${n} kreditter`,
    visningLabel: "Billeder",
    fejlVisningMangler: "Vælg mindst ét billede.",
    // Dataanalyse 23/8: generisk-skabelonen fejlede 4 af 5 onmodel-kørsler —
    // ukendte varetyper afvises FØR brugeren betaler, med en vej videre.
    fejlUkendtKategori:
      "Vi kan ikke lave billeder af den varetype endnu. Vælg en af typerne i listen — eller beskriv varen med et ord vi kender, fx kjole, jeans, shorts, jakke, skjorte, trøje eller taske.",
    fejlForFaaKreditter: (n: number) =>
      `Du skal bruge ${n} kreditter til ${n} billeder. Fyld op, eller vælg færre billeder.`,
  },
  // Onboarding (ejer-ordre 2026-08-20): personen på billederne skal ligne sælgeren
  onboarding: {
    titel: "Hvem skal vise tøjet frem?",
    forklaring:
      "Billederne genereres med en anonym person, der ligner dig — så din profil hænger sammen. Ansigtet er altid skjult, og du kan ændre valget her når som helst.",
    koenTitel: "Person på billederne",
    koenValg: [
      { id: "mand", navn: "Mand" },
      { id: "kvinde", navn: "Kvinde" },
    ],
    haarTitel: "Hårfarve",
    haarHjaelp: "Valgfrit — gør personen mere genkendelig som dig.",
    haarValg: [
      { id: "sort", navn: "Sort" },
      { id: "brunt", navn: "Brunt" },
      { id: "blondt", navn: "Blondt" },
      { id: "roedt", navn: "Rødt" },
      { id: "graat", navn: "Gråt" },
      { id: "moerkt", navn: "Mørkt" },
    ],
    // Fører tilbage til oversigten (ejer-ordre 20/8) — teksten må ikke love
    // at man lander midt i wizarden
    gemKnap: "Gem og fortsæt",
    fejlKoenMangler: "Vælg om personen på billederne skal være mand eller kvinde.",
    fejlMigration:
      "Profil-felterne findes ikke i databasen endnu (migration 20260820110000). Kør den, og prøv igen.",
    fejlIkkeGemt:
      "Valget nåede ikke frem til din profil. Prøv igen — bliver det ved, så sig til.",
    // Banner på oversigten indtil valget er truffet
    bannerTekst:
      "Vælg hvem der skal vise tøjet frem på dine billeder — så ligner personen dig fra første annonce.",
    bannerKnap: "Vælg nu",
  },
  resultat: {
    titelArbejder: "Din annonce er på vej",
    // B-9 batch: pipelinen kører færdig i baggrunden — man kan fotografere videre
    batchTitel: "Du behøver ikke vente her",
    batchTekst:
      "Annoncen bliver færdig i baggrunden — du finder den på oversigten, når den er klar.",
    batchKnap: "Fotografér det næste imens",
    trin: {
      cleanup: "Renser dine fotos",
      onmodel: "Laver de valgte billeder",
      text: "Skriver annoncetekst",
    },
    // Ejer-ordre 20/8: tydeligere fremdrift på "på vej"-siden
    procentFaerdig: (p: number) => `${p} % færdig`,
    // Bulletproof (ejer-ordre 20/8): hængende/fejlet kørsel kan genstartes
    genoptagTitel: "Det tog længere end det skulle",
    genoptagTekst:
      "Noget drillede undervejs. Tryk, så kører vi den igen med de samme valg — det koster ikke ekstra, og fejlede billeder refunderes automatisk.",
    genoptagKnap: "Kør igen",
    genoptagArbejder: "Genstarter …",
    genoptagKoerer: "Annoncen arbejder stadig — vent et øjeblik.",
    genoptagForMange:
      "Annoncen er kørt for mange gange. Anmod om kredit retur på annoncesiden, så kigger vi på den.",
    // Ejer-ordrer 20/8: ærlig forventning + færdige billeder løbende
    tidsForventning:
      "Regn med 2–3 minutter pr. billede. De færdige billeder dukker op herunder, så snart de er klar — du kan roligt lukke siden imens.",
    faerdigeBilleder: (n: number, total?: number) =>
      total && total > 0
        ? `${n} af ${total} billeder er klar`
        : n === 1
          ? "1 billede er klar"
          : `${n} billeder er klar`,
    billederPaaVej: "Dine billeder",
    genererFrame: "Genererer …",
    aabnFuldStoerrelse: "Åbn i fuld størrelse",
    rulNed: "Titel, beskrivelse og prisforslag ligger lige herunder",
    // Roterende statustekster i genererings-framen (ejer-ordre 20/8: mere liv)
    genererTekster: [
      "Tegner tøjet …",
      "Sætter lyset …",
      "Finder vinklen …",
      "Finpudser detaljer …",
      "Tjekker mod dit foto …",
    ],
    trinBilledTaeller: (faerdige: number, alle: number) =>
      `${faerdige} af ${alle}`,
    trinVenter: "venter",
    trinIGang: "i gang",
    trinFaerdig: "færdig",
    trinFejlet: "sprang over",
    downloadFoto: "Hent foto",
    visualiseringTitel: "Visualisering",
    visualiseringForklaring:
      "Sådan kan tøjet se ud på. Billedet er genereret ud fra dit foto og mærket som visualisering.",
    visualiseringBadge: "Visualisering",
    visualiseringFejlede:
      "Visualiseringen ramte ikke vores kvalitetskrav denne gang, så vi leverer den ikke — og kreditten for den er sat tilbage. Din annoncetekst er klar herunder.",
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
      "Upload dit eget foto af tøjet som billede 1 — det ægte foto skal altid komme først.",
      "Tilføj visualiseringen bagefter — aldrig som første billede.",
      "Kopiér titel og beskrivelse ind fra Selja.",
      "Sæt prisen ud fra prisforslaget, og justér efter din tidshorisont.",
      "Tjek at fejl og slid står i beskrivelsen, og send annoncen af sted.",
    ],
    vintedDisclaimer:
      "Vinteds regler ændrer sig — Selja følger dem, det bør du også.",
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
    // Kladde med kørende pipeline (B-9): adskil "arbejder" fra "efterladt"
    paaVej: "På vej",
    gikIStaa: "Gik i stå — åbn og kør igen",
    filterLabel: "Vis kun",
    filterAlle: "Alle",
    filterTom: "Ingen annoncer med den status endnu.",
    markerSolgt: "Markér som solgt",
    salgsprisLabel: "Salgspris i kr.",
    gemSalg: "Gem salget",
    statistikTitel: "Dine tal",
    solgteAntal: (antal: number) => (antal === 1 ? "1 solgt" : `${antal} solgte`),
    // Heltestallet i statistik-blokken: kæmpe mono-tal + denne linje under (REDESIGN §3.5)
    solgtMedSelja: "solgt med Selja",
    liggetid: (dage: number) =>
      dage === 1 ? "1 dag i snit før salg" : `${dage} dage i snit før salg`,
    // Slet med dobbelt bekræftelse (ejer-ordre 20/8)
    sletKnap: "Slet annonce",
    sletBekraeft: "Er du sikker? Sletningen kan ikke fortrydes.",
    sletPermanent: "Slet permanent",
    sletFortryd: "Fortryd",
    // Smart Salgsplan (ejer-ordre 20/8) — abonnent-fordelen
    salgplanTitel: "Din smarte salgsplan",
    salgplanStempel: "For abonnenter",
    salgplanLead:
      "Regnet ud fra dine annoncer, sæsonen og ægte salgspriser — det, en travl sælger aldrig selv når at regne ud.",
    salgplanTom: "Ingen anbefalinger lige nu — dine annoncer kører fint.",
    salgplanHandling: {
      saelgNu: "Sælg nu",
      saetNed: "Sæt prisen ned",
      klarGoer: "Klargør",
      vent: "Vent lidt",
    },
    salgplanTeaserTitel: "Smart Salgsplan er for abonnenter",
    salgplanTeaserTekst:
      "Salgsplan med konkrete råd, garderobe-radar med ægte markedspriser, sæson-kalender og ugens plan på mail hver mandag. Regnet ud fra dine annoncer, sæsonen og ægte salgspriser.",
    salgplanTeaserKnap: "Se abonnementer",
    // Oprydning (ejer 22/8: "rodet, svært at nå sine annoncer"): annoncerne
    // står øverst, og værktøjs-panelerne er foldet sammen under denne overskrift
    vaerktoejTitel: "Salgsværktøjer",
    vaerktoejLead: "Fold ud, når du skal bruge dem. Dine annoncer står øverst.",
    // Sæson-kalender (alle abonnenter, 21/8)
    kalender: {
      titel: "Sæson-kalender",
      lead: "Hvornår topper din garderobe? Månederne herunder er dem, hvor noget af dit tøj sælger bedst.",
      nu: "nu",
      tomMaaned: "Intet topper denne måned — se salgsplanen for hvad du kan gøre.",
    },
    // Konkurrent-tjek (kun Pro, 21/8)
    konkurrent: {
      titel: "Konkurrent-tjek",
      stempel: "Kun Pro",
      dinPris: (kr: number) => `Din: ${kr} kr.`,
      marked: (p25: number, p75: number) => `Markedet: ${p25}–${p75} kr.`,
      note: "Kvartiler fra ægte Vinted-annoncer for samme mærke og kategori.",
    },
    // Garderobe-radar (abonnent-fordel, 21/8)
    radar: {
      titel: "Garderobe-radar",
      garderobeVaerdi: (antal: number, sumDkk: number) =>
        `Dine ${antal} aktive annoncer er cirka ${sumDkk} kr. værd tilsammen.`,
      bedsteKategori: (navn: string, sumDkk: number) =>
        `Din bedste kategori er ${navn.toLowerCase()} (${sumDkk} kr. solgt).`,
      sourcingTitel: "Værd at source lige nu",
      note: "Priser er medianer fra ægte Vinted-annoncer — brug dem som pejling, når du køber ind til videresalg.",
    },
    // Annonce-doktor (alle abonnenter, 22/8): sundhedstjek pr. annonce.
    // Plus ser de 3 der trænger mest; Pro ser alle.
    doktor: {
      titel: "Annonce-doktor",
      lead: "Hver aktiv annonce tjekkes for det, der holder den fra at sælge: fotos, pris mod markedet, sæson, liggetid og titel. Lavest score først.",
      score: (tal: number) => `${tal}/100`,
      altOk: "Ingen råd — annoncen står skarpt.",
      plusNote: "Plus viser de 3 annoncer, der trænger mest. Pro tjekker dem alle.",
      note: "Pris-rådene bygger på ægte Vinted-annoncer for samme mærke og kategori.",
    },
    // Pris-trappe (alle abonnenter, 22/8): nedtrapningsplanen pr. annonce
    pristrappe: {
      titel: "Pris-trappe",
      lead: "Hvornår sætter du ned, og til hvad? Trappen viser prisplanen for hver annonce — følg den, til den er solgt.",
      trinFra: (dag: number) => (dag === 0 ? "fra start" : `fra dag ${dag}`),
      trinNu: "her er du",
      liggetid: (dage: number) =>
        dage === 1 ? "har ligget 1 dag" : `har ligget ${dage} dage`,
      note: "Trinnene er markedets øvre kvartil, median og nedre kvartil fra ægte Vinted-annoncer for samme mærke og kategori.",
    },
    // Flip-beregner (kun Pro, 22/8): maks indkøbspris + forventet gevinst
    flip: {
      titel: "Flip-beregner",
      stempel: "Kun Pro",
      lead: "Hvad må du højst give for det i genbrug? Loftet giver margen til porto, liggetid og forhandling — resten er din gevinst, hvis du sælger til medianen.",
      koebMaks: (kr: number) => `køb maks ${kr} kr.`,
      gevinst: (kr: number) => `~${kr} kr. gevinst`,
      note: "Loftet er 40 % af medianen fra ægte Vinted-annoncer. En pejling til indkøbet — ingen garanti for salg.",
    },
  },
  suppliers: {
    titel: "Suppliers",
    stempel: "Kommer snart",
    kortTekst:
      "Kuraterede supplier-links kommer efter lanceringen af Seljas Vinted-værktøj.",
    laesMere: "Læs mere",
    sideIntro:
      "Vi bygger en lille butik med kuraterede supplier-links. Den åbner først, når Vinted-værktøjet er godt lanceret.",
    fokusTitel: "Vinted først",
    fokusTekst:
      "Lige nu bruger vi kræfterne på at gøre dine Vinted-annoncer hurtigere og bedre. Supplier-butikken åbner som næste del af Selja.",
    indholdTitel: "Det får du, når vi åbner",
    indhold: [
      "Et direkte supplier-link, som er manuelt undersøgt af Selja.",
      "Klare oplysninger om kategori, land, minimumsbestilling og levering, før du vælger.",
      "Et engangskøb i danske kroner, helt adskilt fra dine billedkreditter.",
    ],
    tilbage: "Tilbage til Oversigt",
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
    fejlSaldo: "Du mangler kreditter til en regenerering. Fyld op under Kreditter.",
    fejlAlmen: "Noget gik galt undervejs. Der er ikke trukket noget — prøv igen.",
  },
  kreditter: {
    titel: "Kreditter",
    // Ejer-ordre 2026-08-20: tælleordet er kreditter (1 kredit = 1 billede)
    forklaring:
      "1 kredit = 1 billede. Kreditterne trækkes, når du sætter genereringen i gang — fejler et billede, får du kreditten tilbage automatisk.",
    saldoNu: (antal: number) => `Du har ${formaterKreditTal(antal)} tilbage.`,
    pakkeNavn: (antal: number) => `Selja · ${antal} kreditter`,
    // Pakkenavne (pricing v3.0) — id'erne fra lib/config.ts
    pakkeNavne: {
      proev: "Prøv",
      saelger: "Sælger",
      bunke: "Bunke",
      lager: "Lager",
      "fyld-op": "Fyld op",
    } as Record<string, string>,
    // Engangskøb (ejer-ordre 21/8: pakkerne tilbage i UI — lav indgang)
    pakkeTitel: "Køb flere kreditter",
    pakkeForklaring:
      "Løbet tør før månedens kvote fyldes op? Køb ekstra kreditter her — de lægges oven i din saldo og gælder 12 måneder fra køb.",
    anbefalet: "Anbefalet",
    pakkeLinje: (antal: number, pris: number) => `${antal} kreditter · ${pris} kr.`,
    pakkeAntal: (antal: number) => `${antal} kreditter`,
    pakkePris: (pris: number) => `${pris} kr.`,
    prisPrStk: (kr: string) => `${kr} kr. pr. kredit`,
    koeb: "Køb",
    koebSucces: "Betalingen gik igennem. Kreditterne står på din saldo om et øjeblik.",
    koebAfbrudt: "Betalingen blev afbrudt. Der er ikke trukket noget.",
    betalingIkkeKlar:
      "Betaling er ikke sat op endnu. Skriv til os, hvis du ser denne besked på det rigtige site.",
    kvittering: "Du får kvittering på mail fra Stripe.",
    // Abonnement på kreditsiden (S36, ejer-ordre 2026-08-16: abonnement er
    // standardvejen). Administration via Stripes kundeportal — nem opsigelse.
    abonnementTitel: "Abonnement",
    abonnementForklaring:
      "Kvoten fyldes hver måned og bruges før dine øvrige kreditter.",
    abonnementAdministrer: "Administrér abonnement",
    abonnementAdministrerHjaelp:
      "Skift kort, se fakturaer eller opsig — du bliver sendt til Stripe.",
    abonnementIngen: "Vi fandt intet abonnement på din e-mail endnu.",
    // Udløb vises ærligt: den generelle regel + den konkrete næste dato
    // Ejer-ordre 22/8: opsigelse må aldrig tage kreditter fra nogen
    beholderVedOpsigelse:
      "Du har ikke et aktivt abonnement lige nu, men dine kreditter er dine — de kan bruges, indtil de udløber. Vil du købe flere, skal du have et abonnement igen.",
    udloebNote: "Kreditter gælder 12 måneder fra køb.",
    udloebNaeste: (antal: number, dato: string) =>
      antal === 1
        ? `1 af dine kreditter udløber ${dato}.`
        : `${formaterKreditTal(antal)} af dine kreditter udløber ${dato}.`,
    // Top-up-kortet — vises kun når saldoen er lav. Konkret, intet pres.
    topUp: {
      titel: "Fyld op",
      linje: (antal: number, pris: number) => `${antal} kreditter mere · ${pris} kr.`,
      forklaring:
        "Din kvote er brugt. Fyld op med det samme — din månedskvote kommer stadig som normalt.",
      // Genvej øverst på kreditsiden (ejer-ordre 22/8): man skal kunne se
      // med det samme, at man kan købe mere — og hoppe direkte derned.
      bannerToem: (saldo: number) =>
        saldo <= 0
          ? "Du er løbet tør for kreditter — køb flere her"
          : `Du har kun ${saldo} kreditter tilbage — køb flere her`,
      bannerNormal: "Løbet tør? Du kan altid købe flere kreditter",
      // Ejer-ordre 2026-08-20: top-up er kun for abonnenter
      kunAbonnenter:
        "Fyld op er for abonnenter. Vælg et abonnement, så er du i gang.",
    },
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
    // Ejer-ordre 2026-08-16: abonnement er standardvejen; top-up kun når man
    // er løbet tør. Leadet sælger abonnementet, ikke pakkerne.
    lead: "Vælg et abonnement, der passer til dit flow. Kvoten fyldes hver måned — og løber du tør, fylder du bare op. Alle priser er med moms.",
    stempel: "1 kredit = 1 billede",
    pakkerTitel: "Kreditpakker",
    // Abonnementer (pricing v3.0, S36) — standardvejen; købes md./år
    abonnement: {
      titel: "Abonnementer",
      // Ejer-ordre 2026-08-20: kvoten omtales som billeder, ikke annoncer —
      // men indpakket ("looks"). IKKE "fotosæt": 1 kredit = 1 billede, så
      // "sæt" ville love for meget (ejer-korrektion).
      lead: "Kvoten fyldes hver måned, og ubrugte looks følger med til næste måned.",
      stempel: "Uden binding",
      periodeMd: "Månedligt",
      periodeAar: "Årligt",
      periodeAarNote: "pr. år — to måneder sparet",
      vaelgPeriode: "Betalingsperiode",
      koebKnap: (navn: string) => `Vælg ${navn}`,
      opsigelse: "Ingen binding — opsig når som helst.",
      navne: { plus: "Plus", pro: "Pro" } as Record<string, string>,
      prMd: "pr. måned",
      prisPrAar: (pris: number) => `eller ${pris} kr. pr. år — to måneder sparet`,
      annoncerPrMd: (antal: number) => `${antal} færdige looks hver måned`,
      lavestePris: "Lavest pris pr. look",
      faellesTitel: "Med i begge",
      faelles: [
        "Smart Salgsplan på oversigten — hvad du skal sælge nu, sætte ned og vente med",
        "Ugens salgsplan på mail hver mandag morgen",
        "Garderobe-radar — hvad din garderobe er værd, og hvad der er værd at source lige nu",
        "Sæson-kalender — hvornår hvert stykke tøj i din garderobe topper",
        "Pris-trappe — en konkret nedtrapningsplan for hver annonce, til den er solgt",
        "Annonce-doktor — sundhedstjek med score og konkrete råd pr. annonce (de 3, der trænger mest)",
        "Salgsstatistik",
        "Prioriteret kø — dine annoncer laves først",
      ],
      funktioner: {
        plus: [
          "Favorit-overvågning: op til 25 favoritter med dagligt overblik på mail og prisanbefaling",
        ],
        pro: [
          "Konkurrent-tjek: din pris mod markedets kvartiler pr. annonce",
          "Flip-beregner: hvad du højst må give i genbrug, og hvad gevinsten cirka er",
          "Annonce-doktor uden loft: alle dine annoncer tjekkes, ikke kun de 3 vigtigste",
          "Favorit-overvågning uden loft, opdateret løbende, med dynamisk prisanbefaling",
          "Besked når lignende annoncer ændrer pris",
          "Ret prisen på flere annoncer ad gangen",
        ],
      } as Record<string, readonly string[]>,
    },
    // Engangspakker offentligt (omsætnings-audit 21/8, punkt 1)
    pakker: {
      titel: "Eller køb kreditter uden abonnement",
      lead:
        "Sælger du sjældnere, kan du købe en pakke og bruge kreditterne, når det passer dig. Abonnementet er billigst pr. kredit — pakkerne er friheden til at slippe.",
      note: "Kreditter fra pakker gælder 12 måneder fra køb. Ingen binding, ingen fornyelse.",
      knap: "Kom i gang",
    },
    saadanTitel: "Sådan virker kreditter",
    punkter: [
      {
        overskrift: "1 kredit = 1 billede",
        tekst: "Renset foto, mærket visualisering og annoncetekst — alt sammen for én kredit.",
      },
      {
        overskrift: "Du betaler først ved levering",
        tekst: "Kreditten trækkes, når annoncen er klar. Fejler visualiseringen, leverer vi resten og sætter kreditten tilbage automatisk.",
      },
      {
        overskrift: "Kreditter gælder 12 måneder",
        tekst: "Ubrugt månedskvote følger med til næste måned, og en top-up gælder et år fra køb. Udløbsdatoen står altid på din kreditside — intet forsvinder, uden at du kan se hvornår.",
      },
      {
        overskrift: "Priser er med moms",
        tekst: "Betaling sker via Stripe, som også sender din kvittering. Alle priser er i danske kroner og inklusive moms.",
      },
    ],
    faqTitel: "Spørgsmål, vi ofte får",
    faq: [
      {
        spoergsmaal: "Lægger Selja annoncen op på Vinted for mig?",
        svar: "Nej. Selja har ingen adgang til din Vinted-konto — det er en pointe, ikke en mangel. Du får billeder og tekst serveret, og kopierer selv ind. Det tager under et minut.",
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
        spoergsmaal: "Skal jeg have et abonnement?",
        svar: "Det er standardvejen: Plus til de fleste, Pro til højt flow — begge uden binding. Løber du tør midt i en måned, fylder du op med en lille top-up fra din kreditside.",
      },
      {
        spoergsmaal: "Skal jeg have en adgangskode?",
        svar: "Ja. Du opretter dig med din e-mail og en adgangskode på mindst 8 tegn — og kan gå i gang med det samme.",
      },
    ],
    ctaTitel: "Vælg et abonnement og gå i gang",
    ctaKnap: "Opret dig og vælg abonnement",
  },
  // Eksperimentelle forside-features (lib/eksperimenter.ts) — ærlige tal fra
  // markedshøsten, aldrig opdigtede. Slås fra centralt.
  // Redesignet 2026-08-20 (ejer-ordre: sektionen skal være et brugbart gratis
  // værktøj, der trækker trafik — ikke døde lister). Pristjekkeren er helten;
  // toplisterne er klikbare genveje ind i den.
  eksperimenter: {
    stempel: "Gratis værktøj",
    titel: "Hvad går dit tøj for på Vinted?",
    lead: (dato: string) =>
      `Slå op i vores markedshøst fra ${dato} — priser fra rigtige aktive Vinted-annoncer. Gratis, uden konto.`,
    antalAnnoncer: (antal: number) => `${antal} aktive annoncer`,
    median: (kr: number) => `median ${kr} kr.`,
    bedsteFundTitel: "Giver mest ved gensalg",
    bedsteFundLead: "Højeste medianpris i høsten — tryk og se intervallet.",
    populaertTitel: "Mest udbudt lige nu",
    populaertLead: "Flest aktive annoncer i høsten — tryk og se prisen.",
    prisTjekTitel: "Hvad kan DIN vare gå for?",
    prisTjekLead:
      "Vælg type, mærke-niveau og stand — få et vejledende prisleje for præcis din vare.",
    kategoriLabel: "Hvad sælger du?",
    maerkeLabel: "Mærke-niveau",
    standLabel: "Stand",
    prisTjekInterval: (p25: number, p75: number) => `${p25}–${p75} kr.`,
    prisTjekIntervalNote: "vejledende prisleje",
    beregnerKilde: (dato: string) =>
      `Kalibreret mod rigtige aktive Vinted-annoncer · høstet ${dato}`,
    hurtigtSalg: (kr: number) => `Vil du sælge hurtigt: læg dig omkring ${kr} kr.`,
    taalmodig: (kr: number) => `Har du tid til at vente: prøv ${kr} kr.`,
    ctaNote: "Gode billeder og en ærlig tekst er det, der flytter prisen.",
    cta: "Gør din annonce klar på 2 minutter",
    presetNote: "Tryk på en søgning og se beregnerens bud mod den ægte median.",
    // Pris-slider: prøv din egen pris mod markedslejet
    sliderLabel: "Prøv din egen pris",
    sliderVaerdi: (kr: number) => `${kr} kr.`,
    zoner: {
      hurtig: "Skarpt sat — her sælger den typisk hurtigst.",
      balance: "God balance mellem pris og ventetid.",
      taalmodig: "Fair pris — men regn med at vente lidt længere.",
      over: "Over markedslejet — kræver perfekte billeder og det rigtige match.",
    } as Record<string, string>,
    // Titel-generator: gratis smagsprøve på søgbare titler
    titelTitel: "Få en søgbar titel",
    titelLead:
      "Vinted-søgningen finder kun det, der står i titlen. Skriv mærket, og få en titel der bliver fundet.",
    titelMaerke: "Mærke",
    titelMaerkePladsholder: "fx Ganni",
    titelFarve: "Farve (valgfri)",
    titelFarvePladsholder: "fx grøn",
    titelStoerrelse: "Størrelse (valgfri)",
    titelStoerrelsePladsholder: "fx S eller W28",
    titelKopier: "Kopiér titlen",
    // Kategori-tips
    tipsTitel: "Sælg den hurtigere",
    // Salgsplan: anbefalet startpris + nedsættelses-tidslinje
    planTitel: "Din salgsplan",
    planStart: (kr: number) =>
      `Start på ${kr} kr. — det er nemmere at sætte ned end op.`,
    planUge2: (kr: number) => `Ikke solgt efter en uge? Sæt den til ${kr} kr.`,
    planUge3: (kr: number) =>
      `Stadig ikke solgt? ${kr} kr. rammer de hurtige købere.`,
    planGebyr:
      "Vinted tager intet gebyr fra sælgere — du får hele beløbet udbetalt.",
    // Foto-tjekliste (spejler appens fire foto-roller)
    tjekTitel: "Klar til at fotografere?",
    tjekPunkter: [
      "Helheden — hele varen i dagslys",
      "Bagsiden",
      "Label med størrelse og materiale",
      "Fejl og slid, tæt på",
    ],
    tjekKlar: "Du har alt, Selja skal bruge.",
    // Slut-henvisning til Selja (ejer-ordre: værktøjet skal ende i Selja)
    seljaTitel: "Lad Selja gøre resten",
    seljaTekst:
      "Upload dine 2–4 fotos — Selja renser billederne, viser tøjet båret og skriver titel, beskrivelse og prisforslag. Klar til Vinted på cirka 2 minutter.",
    // Dynamisk CTA (konverterings-plan 20/8): brugerens egen vare og tal
    seljaDynamisk: (navn: string, kr: number) =>
      `Din ${navn.toLowerCase()} kan gå for ~${kr} kr. — gør den klar nu`,
  },
  landing: {
    // v6 (ejer-beslutning 2026-08-15): forsiden fører med B2B — UGC-annoncer,
    // annoncebilleder og hjemmesider. Appen har egen sektion. Ingen priser her.
    heroTitel: "UGC-annoncer og hjemmesider til virksomheder",
    heroRubrik: "Annoncer, folk ikke scroller forbi",
    heroTekst:
      "Selja er et lille dansk studio. Vi laver UGC-video, annoncebilleder og hjemmesider for virksomheder, der vil se ægte ud — ikke som reklame. Fast pris pr. opgave, og I ejer alt materialet.",
    heroKnap: "Skriv til os",
    heroSekundaer: "Sælger du tøj på Vinted? Se appen",
    ydelserTitel: "UGC til virksomheder",
    ydelser: [
      {
        titel: "UGC-videoannoncer",
        tekst:
          "Manus, optagelse og klip i 9:16 — videoer der ligner en anbefaling fra en ven, ikke et tv-spot. Klar til Meta og TikTok.",
        leverance: "Klip i 9:16 · undertekster med · klar til upload",
      },
      {
        titel: "Annoncebilleder",
        tekst:
          "Jeres egne produktfotos renset og sat i scene, plus before/after-materiale der viser forskellen i stedet for at påstå den.",
        leverance: "Renset og beskåret · 4:5 og 9:16 · katalogklar",
      },
      {
        titel: "Hjemmesider",
        tekst:
          "Én side, ét budskab, én handling. Hurtig på mobilen og skrevet på dansk, der lyder som jer — I får det hele udleveret.",
        leverance: "Mobil-først · dansk copy · I ejer koden",
      },
    ],
    ydelserCta:
      "Fortæl os, hvad I sælger — I får ét konkret oplæg og én fast pris retur.",
    b2bFaqTitel: "Spørgsmål, virksomheder stiller os",
    b2bFaq: [
      {
        spoergsmaal: "Hvad koster det?",
        svar: "Én fast pris pr. opgave, aftalt på forhånd. Ingen abonnement og ingen timer, der løber.",
      },
      {
        spoergsmaal: "Hvem ejer materialet?",
        svar: "I gør. Video, billeder, tekst og arbejdsfiler bliver jeres — brug dem hvor og så længe I vil.",
      },
      {
        spoergsmaal: "Hvor hurtigt kan I levere?",
        svar: "Afhænger af pakken — I får en konkret dato i oplægget, og fristen løber fra vi har modtaget jeres materiale.",
      },
    ],
    appenMaerkat: "Vinted-appen",
    appenTitel: "Sælger du tøj på Vinted?",
    appenTekst:
      "Selja-appen renser dine mobilfotos, viser hvordan tøjet ser ud på, og skriver titel, beskrivelse og prisforslag — klar til at sætte ind på Vinted på cirka 2 minutter.",
    appenKnap: "Lav min annonce",
    // Før/efter-kortene (v3): annoncen som transformation — den sjuskede seddel
    // mod den færdige leverance. Skitseret eksempel, tydeligt mærket som sådan.
    foerKort: {
      label: "Før",
      tekst: "blå strik sælges, str m tror jeg, brugt men fin",
      pris: "100 kr. eller byd",
    },
    efterKort: {
      label: "Efter — med Selja",
      titel: "Mørkeblå uldstrik · str. M",
      punkter: [
        "Rensede fotos, klar til Vinted",
        "Visualisering — altid mærket",
        "Fejl oplyst ærligt i teksten",
      ],
      pris: "Prisforslag: 120–160 kr.",
    },
    heroPladsholder:
      "Skitseret eksempel — når appen er i drift, viser vi et ægte før/efter herfra.",
    saadanTitel: "Sådan virker det",
    saadanTrin: [
      {
        titel: "Fotografér",
        tekst: "2–4 fotos med telefonen: helhed, bagside, label og eventuelle fejl.",
      },
      {
        titel: "Selja arbejder",
        tekst: "Billederne renses, en mærket visualisering laves, og annonceteksten skrives — på cirka 90 sekunder.",
      },
      {
        titel: "Sæt ind på Vinted",
        tekst: "Kopiér titel og beskrivelse, hent billederne, og læg annoncen op. Fejl og slid står ærligt i teksten.",
      },
    ],
    // Ejer-ordre 2026-08-15: Ærligheds-blokken er taget af forsiden — teksten
    // genskrives senere et andet sted. Erstattet af B2B-forløbet.
    procesTitel: "Sådan foregår det",
    procesTrin: [
      {
        titel: "Skriv til os",
        tekst: "To linjer om, hvad I sælger, er nok. Vedhæft gerne jeres nuværende annoncer.",
      },
      {
        titel: "I får ét oplæg",
        tekst: "Konkret indhold, én fast pris. Ingen abonnement, ingen møderække.",
      },
      {
        titel: "Vi leverer",
        tekst: "Materialet er jeres — også arbejdsfilerne. Brug det, hvor I vil.",
      },
    ],
    // Billedserie v3 (genererede eksempler — ejer-ordre 2026-08-15: ingen
    // synlig mærkat, midlertidigt; provenance dokumenteret i STATUS.md. Ægte
    // output erstatter serien efter S12/S25.) Stilen er Vinted-annoncer der
    // sælger: spejl-selfies, tøj på bøjle, flatlay — skandinavisk og realistisk.
    billedserie: [
      {
        src: "/eksempler/spejl-strik.webp",
        alt: "Spejl-selfie i mørkeblå uldstrik og lyse jeans i et lyst soveværelse",
      },
      {
        src: "/eksempler/strik-vindue.webp",
        alt: "Cremefarvet grov cardigan båret ved et vindue med hørgardiner",
      },
      {
        src: "/eksempler/skjorte-doer.webp",
        alt: "Lyseblå stribet skjorte på træbøjle på en hvid garderobedør",
      },
      {
        src: "/eksempler/spejl-jakke.webp",
        alt: "Spejl-selfie i olivengrøn uld-overshirt i en lys entré",
      },
      {
        src: "/eksempler/flatlay-seng.webp",
        alt: "Rustbrun merinostrik og lyse jeans foldet på hørsengetøj, set ovenfra",
      },
      {
        src: "/eksempler/denim-detalje.webp",
        alt: "Nærbillede af denim: linning, knap og vaskemærke",
      },
      {
        src: "/eksempler/gade-look.webp",
        alt: "Kamelfarvet uldfrakke over grå strik på en københavnsk gade",
      },
    ],
    ctaTitel: "Skal vi lave jeres næste annonce?",
    ctaVirksomhedKnap: "Skriv til os",
    ctaAppKnap: "Opret dig og lav din første annonce",
  },
  vilkaar: {
    titel: "Vilkår",
    opdateret: "Senest opdateret: 16. august 2026",
    afsnit: [
      {
        overskrift: "Hvad Selja er",
        tekst: [
          "Selja hjælper dig med at lave annoncer til dit brugte tøj: rensede billeder, en tydeligt mærket visualisering og en færdig annoncetekst. Du lægger selv annoncen på Vinted — Selja har ingen adgang til din Vinted-konto.",
        ],
      },
      {
        overskrift: "Krav til dig",
        tekst: [
          "Du skal være mindst 18 år for at bruge Selja — det er også Vinteds egen aldersgrænse.",
          "Du må kun uploade billeder af tøj, du selv ejer og har ret til at sælge, og du er ansvarlig for indholdet af de annoncer, du lægger op.",
          "Selja er lavet til privat salg af brugt tøj. Brug ikke Selja til kommercielt salg på en privat Vinted-konto — det er brud på Vinteds vilkår og kan koste dig kontoen.",
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
          "1 kredit svarer til 1 genereret billede. Kreditterne trækkes, når genereringen sættes i gang. Fejler et billede, leverer vi resten og sætter kreditten for det fejlede billede tilbage automatisk.",
          "Betaling sker via Stripe, som også sender din kvittering. Priserne er i danske kroner og inklusive moms. Købte kreditter gælder 12 måneder fra købsdatoen — udløbsdatoen vises på din kreditside.",
        ],
      },
      {
        overskrift: "Abonnement",
        tekst: [
          "Abonnementet fylder din kvote hver måned og fornys automatisk — månedligt eller årligt, alt efter hvad du har valgt — indtil du opsiger det. Der er ingen binding: du kan opsige når som helst under Kreditter → Administrér abonnement, og abonnementet løber så perioden ud uden at forny.",
          "Ubrugt månedskvote følger med til næste måned, dog højst op til det dobbelte af din månedskvote ad gangen.",
          "Du har 14 dages fortrydelsesret på køb. Når du bruger kreditter, accepterer du, at leveringen går i gang med det samme — fortryder du inden for fristen, refunderer vi det, du ikke har brugt.",
          "Ændrer vi priserne, varsler vi dig pr. mail mindst 30 dage, før ændringen rammer dit abonnement.",
        ],
      },
      {
        overskrift: "Ansvar",
        tekst: [
          "Selja leverer værktøjet — selve handlen er mellem dig og din køber. Vi kan ikke garantere, at dit tøj bliver solgt, og vi er ikke part i dine handler på Vinted.",
          "Vinteds regler ændrer sig løbende. Selja følger dem — det bør du også.",
        ],
      },
      {
        overskrift: "Ophør",
        tekst: [
          "Du kan slette din konto når som helst under Konto. Så sletter vi dine billeder, annoncer og kontodata inden for 24 timer. Bilag for dine køb skal vi efter bogføringsloven gemme i 5 år — de ligger hos Stripe og i vores regnskab, ikke som en aktiv profil.",
          "Har du et aktivt abonnement, så opsig det under Kreditter → Administrér abonnement, inden du sletter kontoen — ellers stopper vi det for dig ved sletningen.",
        ],
      },
    ],
  },
  privatliv: {
    titel: "Privatliv",
    opdateret: "Senest opdateret: 21. august 2026",
    afsnit: [
      {
        overskrift: "Kort version",
        tekst: [
          "Dine billeder bruges kun til at lave din egen annonce. Vi træner ikke modeller på dem, vi deler dem ikke, og vi sælger ingen data. Sletter du din konto, sletter vi dine billeder og annoncedata inden for 24 timer — kun bilag for dine køb gemmes længere, fordi bogføringsloven kræver det.",
        ],
      },
      {
        overskrift: "Hvem er ansvarlig",
        tekst: [
          "Dataansvarlig er Selja. Har du spørgsmål om dine data, så skriv til visual.studio.tuturials@gmail.com — adressen skifter til en domæne-mail, når domænet er på plads.",
        ],
      },
      {
        overskrift: "Hvad vi gemmer, og hvorfor vi må",
        tekst: [
          "Din e-mail og adgangskode (til at logge ind og til beskeder om dine annoncer), dine billeder og annoncedata, din kredithistorik og abonnementsstatus samt tekniske logs om genereringer (status og omkostning), så tjenesten kan fungere og fejl kan findes.",
          "Grundlaget er aftalen med dig (GDPR art. 6, stk. 1, litra b) for alt, der skal til for at levere tjenesten, retlige forpligtelser (litra c) for bogføringsbilag, og vores legitime interesse (litra f) for tekniske fejllogs.",
          "Betalingsoplysninger håndteres af Stripe — vi ser aldrig dit kortnummer.",
          "Selja er for brugere på 18 år eller derover; det bekræfter du ved oprettelsen.",
        ],
      },
      {
        overskrift: "Hvem behandler data for os",
        tekst: [
          "Supabase: database og billeder, hostet i EU (Irland), privat lager med midlertidige links.",
          "Netlify: drift af selve siden. Trigger.dev: kører de tunge genereringsjobs.",
          "Stripe: betaling, abonnement og kvitteringer. Resend: de mails, vi sender dig — inklusive login- og bekræftelsesmails.",
          "Google (Gemini): billedmodellen, der renser dine fotos, laver visualiseringen og kvalitetstjekker resultatet. Dine billeder sendes kun dertil — og kun for at lave netop din annonce, aldrig til træning, aldrig til andre kunder.",
          "Annonceteksten skrives af en ekstern sprogmodel-leverandør, der udelukkende modtager de oplysninger, du selv har tastet ind om tøjet (mærke, størrelse, stand, fejl) — aldrig dine billeder, dit navn eller din e-mail.",
        ],
      },
      {
        overskrift: "Overførsel til lande uden for EU/EØS",
        tekst: [
          "Nogle af leverandørerne behandler data uden for EU/EØS, blandt andet i USA. Overførslerne sker efter EU's godkendte rammer (EU-U.S. Data Privacy Framework eller EU's standardkontraktbestemmelser med supplerende foranstaltninger), og vi holder en liste over grundlaget pr. leverandør, som du kan bede om at se.",
        ],
      },
      {
        overskrift: "Hvor længe",
        tekst: [
          "Så længe du har en konto. Sletter du den under Konto, fjernes billeder, annoncer og kontodata inden for 24 timer. Bilag for køb opbevares i 5 år efter regnskabsårets udløb (bogføringsloven) — hos Stripe og i vores regnskab.",
        ],
      },
      {
        overskrift: "Cookies",
        tekst: [
          "Kun det nødvendige: en login-session, når du er logget ind. Ingen annonce-cookies, ingen tredjeparts-statistik og intet cookie-banner. Vi fører vores egen cookieløse besøgsstatistik (hvilken side, hvilken kilde/kampagne og om enheden er mobil) — uden cookies, uden IP-adresser og uden noget, der kan identificere dig.",
        ],
      },
      {
        overskrift: "Dine rettigheder",
        tekst: [
          "Du kan få indsigt i, rette, flytte eller slette dine data og gøre indsigelse mod behandlingen.",
          "Indsigt og flytning klarer du selv: under Konto kan du hente alle dine data som en fil, der kan læses af både dig og andre programmer. Sletning klarer du også selv samme sted.",
          "Vil du have noget rettet, eller har du et spørgsmål, så skriv til os — vi svarer inden for en måned, som loven kræver. Er du ikke tilfreds, kan du klage til Datatilsynet (datatilsynet.dk).",
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
    // Nøgletal øverst (avanceret panel, 21/8)
    noegletal: {
      brugere: "Brugere",
      nyeSyvDage: (antal: number) => `+${antal} de sidste 7 dage`,
      aktiveAnnoncer: "Aktive annoncer",
      solgte: "Solgte",
      solgtFor: "Solgt for i alt",
    },
    // Trafik (21/8 nat): cookieløs statistik
    trafik: {
      titel: "Trafik",
      forklaring: "Cookieløs — ingen IP, ingen identitet, kun side, kilde, UTM og enhed.",
      // Unikke besøgende (22/8): daglig roterende hash, samme greb som Plausible
      unikForklaring:
        "Unikke tælles med en hash, der skifter hver nat: kommer nogen igen i morgen, tælles de som ny. Vi kan aldrig følge en person over tid.",
      migrationMangler:
        "Unikke besøgende kræver migration 20260822180000 — kør den i Supabase, så begynder tallet at tælle.",
      mobilAndel: (pct: number) => `${pct} % af besøgene er fra mobil.`,
      tom: "Ingen besøg i den valgte periode.",
      periode: { 1: "I dag", 7: "7 dage", 30: "30 dage" } as Record<number, string>,
      alleKilder: "Alle kilder",
      unikke: "Unikke",
      visninger: "Visninger",
      prBesoegende: "Sider pr. besøg",
      mobil: "Mobil",
      prDag: "Pr. dag (unikke / visninger)",
      topSider: "Mest viste sider",
      topKilder: "Kilder (unikke / visninger)",
      topKampagner: "UTM-kampagner",
    },
    // Forside-billeder (21/8 nat): upload uden deploy
    forsideBilleder: {
      titel: "Forside-billeder",
      forklaring: "Upload billeder til forsidens serie og strøm — de er live inden for 5 minutter, uden deploy. Kun webp/jpg/png; de konverteres og skaleres automatisk.",
      uploadKnap: "Upload billeder",
      uploader: "Uploader…",
      sletKnap: "Slet",
      tom: "Ingen uploadede billeder endnu — forsiden viser den bundlede serie.",
      note: "Billederne mærkes som resten af serien af forsidens fælles note.",
      fejlIngenFil: "Vælg mindst én billedfil.",
      fejlForStor: "Billedet er over 8 MB — gør det mindre først.",
      fejlUgyldig: "Filen kunne ikke læses som et billede.",
    },
    // Billedmodel-valg (ejer-ordre 23/8): modellen vælges her, ikke i koden
    billedmodel: {
      titel: "Billedmodel",
      forklaring:
        "Vælg hvilken model brugernes billeder køres på. Skiftet gælder fra næste annonce — ingen deploy. Rens er det billige trin; visualiseringen er det dyre, og det er dér kvaliteten mærkes.",
      rens: "Baggrundsrens",
      visualisering: "Visualisering (on-model)",
      pris: (kr: number) => `${kr.toFixed(2).replace(".", ",")} kr. pr. billede (skøn)`,
      vandmaerke: (tekst: string) => `Vandmærke: ${tekst}`,
      note: "Googles modeller lægger SynthID i pixels, og det kan ikke slås fra. Skal der være nul vandmærke, skal begge trin stå på en fal-model.",
      knap: "Gem valg",
      gemmer: "Gemmer…",
      ok: (rens: string, visualisering: string) =>
        `Gemt. Rens: ${rens}. Visualisering: ${visualisering}.`,
      fejlUkendtModel: "Ukendt model — vælg en fra listen.",
      fejlGem:
        "Kunne ikke gemme valget. Er migration 20260823100000_indstillinger kørt i Supabase?",
    },
    // Gratis trial-drift (ejer-ordre 25/8): toggle + budgetloft uden deploy
    trial: {
      titel: "Gratis trial",
      forklaring:
        "Prøven på /prov: ét gratis flat-lay-billede + annonce uden konto. Slår du den fra, afvises nye forsøg med det samme — uden deploy. Budgetloftet lukker automatisk for resten af døgnet, når dagens estimerede trial-forbrug rammer det.",
      aktivLabel: "Gratis trial aktiv",
      budgetLabel: "Dagligt budgetloft for trials (kr.)",
      knap: "Gem",
      gemmer: "Gemmer…",
      ok: (aktiv: boolean, budget: number) =>
        `Gemt. Trialen er ${aktiv ? "åben" : "LUKKET"}, budgetloft ${budget} kr. pr. døgn.`,
      fejlUgyldig: "Ugyldige værdier — budgettet skal være 0–10.000 kr.",
      fejlGem:
        "Kunne ikke gemme. Er migration 20260823100000_indstillinger kørt i Supabase?",
      // Dagens tal + konvertering (læses direkte af admin-siden)
      dagensForbrug: "Dagens trial-forbrug",
      dagensTrials: "Trials i dag",
      dagensTrialsTal: (completed: number, failed: number, blocked: number) =>
        `${completed} leveret · ${failed} fejlet · ${blocked} blokeret`,
      konvertering: "Trial → signup (i alt)",
      konverteringTal: (signups: number, completed: number) =>
        completed > 0
          ? `${signups} af ${completed} (${Math.round((signups / completed) * 100)} %)`
          : "Ingen leverede trials endnu.",
      migrationMangler:
        "Trial-tallene kræver migration 20260825120000_trial — kør den i Supabase.",
    },
    // Manuel kredittildeling (ejer-ordre 22/8)
    tildel: {
      titel: "Tildel kreditter",
      forklaring:
        "Giv en bruger kreditter — til support, kompensation ved fejl, testbrugere eller kampagner. Negativt tal trækker fra. Tildelingen står i brugerens historik som alle andre.",
      emailLabel: "Brugerens e-mail",
      antalLabel: "Antal kreditter",
      noteLabel: "Begrundelse",
      notePladsholder: "Fx: kompensation for fejlet generering 22/8",
      knap: "Tildel",
      ok: (antal: number, email: string, saldo: number) =>
        `${antal > 0 ? "Tildelte" : "Trak"} ${Math.abs(antal)} kreditter ${antal > 0 ? "til" : "fra"} ${email}. Ny saldo: ${saldo}.`,
      fejlEmail: "Skriv brugerens e-mail.",
      fejlAntal: (maks: number) => `Antal skal være mellem -${maks} og ${maks} og ikke 0.`,
      fejlNote: "Skriv en kort begrundelse — den gemmes i historikken.",
      fejlUkendt: "Ingen bruger med den e-mail.",
      fejlSaldo: "Kunne ikke trække så mange — brugeren har ikke saldo nok.",
    },
    henvendelserTitel: "Kontakt-henvendelser",
    henvendelserTom: "Ingen henvendelser endnu.",
    feedbackTitel: "Feedback fra brugerne",
    feedbackTom: "Ingen feedback endnu.",
    // Content-værktøjer (21/8): prompts klar til Claude/ChatGPT
    content: {
      titel: "Content-værktøjer",
      forklaring:
        "Kopiér en prompt, sæt den ind i Claude eller ChatGPT, og få udkast i Seljas tone med rigtige tal og fakta. Læs altid udkastet igennem før det postes.",
      kopierKnap: "Kopiér prompt",
      kopieret: "Kopieret ✓",
    },
    dagensForbrug: "Dagens API-forbrug (globalt loft)",
    loftNaaet: "Loftet er nået — nye pipelines afvises indtil midnat (UTC).",
    // Ejer-ordre 20/8: kost pr. kredit skal kunne aflæses direkte
    kostPrKredit: "Kost pr. kredit (7 dage)",
    kostPrKreditForklaring:
      "Samlet API-omkostning delt med antal leverede billeder — hver kredit skal holdes billigere end prisen, brugeren betaler.",
    prDag: "Forbrug pr. dag (7 dage)",
    prBruger: "Forbrug pr. bruger (7 dage)",
    senesteGenereringer: "Seneste genereringer",
    // Fejl ved billedgenerering (23/8): årsagen vises, ikke kun status
    genFejl: {
      titel: "Fejl ved generering (7 dage)",
      tom: "Ingen fejlede genereringer — alt er leveret.",
      udenTekst: "Ingen fejltekst gemt (før 23/8-opdateringen).",
    },
    klagerTitel: "Klager (kredit retur)",
    ingenKlager: "Ingen åbne klager.",
    godkendKnap: "Godkend + refundér",
    afvisKnap: "Afvis",
    // Ejer-ordre 20/8: admin ser alt relevant direkte i klagen
    klageFejlFelt: "Oplyste fejl",
    klageGenererede: "Genererede billeder (det der bedømmes)",
    klageIngenBilleder: "Ingen genererede billeder på annoncen.",
    klageBrugerFotos: "Brugerens egne fotos (reference)",
  },
  // Gratis prøve uden konto (ejer-ordre 25/8): /prov — mobil-først, ét foto,
  // ingen formularer. Blokeringsbeskeder er venlige og peger altid på signup.
  prov: {
    titel: "Prøv Selja gratis",
    metaBeskrivelse:
      "Tag ét billede af dit tøj og se, hvad Selja laver af det — produktbillede, annoncetekst og prisforslag. Uden konto, uden betalingskort.",
    rubrik: "Se hvad dit tøj er værd — gratis",
    lead: "Tag ét billede af dit tøj. Selja laver et produktbillede, skriver annoncen og foreslår en pris. Ingen konto, intet kort.",
    uploadKnap: "Tag et billede af dit tøj",
    uploadHjaelp: "Ét foto er nok — læg tøjet frem, så det hele kan ses.",
    // Loading (forventningen sættes ærligt — genereringen tager op til et par minutter)
    laverBillede: "Selja arbejder på dit tøj …",
    laverBilledeDetalje: (sekunder: number) =>
      `Produktbillede, annonce og prisforslag er typisk klar på ${Math.round(sekunder / 60)}–${Math.ceil(sekunder / 60) + 1} minutter. Bliv på siden.`,
    // Resultatet
    resultatRubrik: "Din annonce er klar",
    prisRubrik: "Prisforslag",
    pris: (fra: number, til: number) => `${fra}–${til} kr.`,
    beskrivelseSkjult: "Resten af annoncen er klar — opret en gratis konto for at se det hele.",
    soegeordFlere: (antal: number) => `+ ${antal} søgeord mere`,
    vandmaerkeNote: "Billedet her har selja.dk-vandmærke og nedsat opløsning.",
    // Låste stilarter (ejer-krav 25/8): ren visuel upsell — kan ALDRIG generere
    laasteStilarter: "Samme foto kan også blive til",
    laasLabel: "Lås op med en konto",
    ctaRubrik: "Få det hele med en gratis konto",
    cta: "Opret gratis konto for at hente billedet uden vandmærke og se hele annoncen",
    ctaNote: "Dit resultat ligger klar på kontoen, lige når du har oprettet dig.",
    // Fejl og blokeringer — venlige, ærlige, altid med en vej videre
    fejlIngenFil: "Vælg et billede først.",
    fejlForStor: "Billedet er over 8 MB — tag det igen eller vælg et mindre.",
    fejlUgyldigFil: "Filen ser ikke ud til at være et billede (jpg, png, webp eller HEIC).",
    fejlKunneIkkeLaeses:
      "Vi kunne ikke læse billedet. Gem det som JPEG (eller tag et screenshot af det), og prøv igen.",
    fejlCaptcha: "Vi kunne ikke bekræfte, at du er et menneske. Genindlæs siden og prøv igen.",
    fejlLukket: "Gratis prøver er lukket lige nu. Opret en gratis konto, så er du klar, når du vil i gang.",
    fejlBudget: "Gratis prøver er brugt op for i dag — prøv igen i morgen, eller opret en gratis konto.",
    fejlAlleredeBrugt:
      "Du har allerede brugt din gratis prøve. Opret en gratis konto for at lave flere annoncer — dit resultat følger med.",
    fejlGenerering:
      "Noget gik galt undervejs, og der blev ikke lavet noget. Du kan prøve igen med et nyt billede.",
    fejlFindesIkke: "Vi kunne ikke finde den prøve — den kan være udløbet.",
    proevIgenKnap: "Prøv igen",
    blokeretCta: "Opret gratis konto",
  },
  // Klage over genereret billede (ejer-ordre 2026-08-20): brugeren kan anmode
  // om sin kredit tilbage; ejeren afgør klagen i admin.
  klage: {
    knap: "Ikke tilfreds med billedet? Anmod om kredit retur",
    titel: "Anmod om kredit retur",
    forklaring:
      "Skriv kort hvad der er galt med det genererede billede. Vi kigger på det og giver dig kreditten tilbage, hvis noget er gået skævt.",
    pladsholder: "Fx: trøjen på billedet har et andet print end min …",
    sendKnap: "Send anmodning",
    senderKnap: "Sender …",
    fortryd: "Fortryd",
    fejl: "Noget gik galt — prøv igen.",
    statusAaben: "Din anmodning om kredit retur er modtaget og afventer svar.",
    statusGodkendt: "Din klage blev godkendt — kreditten er sat tilbage på din saldo.",
    statusAfvist: "Din klage er behandlet og blev afvist.",
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
    studio: "Selja Studio — annoncer for virksomheder",
    maerkning:
      "Alle visualiseringer er mærket — synligt og i filens metadata. Det kræver loven, og det er kun rimeligt.",
  },
  fejl: {
    generel: "Noget gik galt. Prøv igen — dine billeder og kreditter er ikke rørt.",
    ikkeLoggetInd: "Du skal være logget ind for at se denne side.",
  },
} as const;

export type Copy = typeof da;
