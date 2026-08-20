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
      "Vælg en e-mail og en adgangskode på mindst 8 tegn. Din konto oprettes med det samme — du kan gå direkte i gang.",
    emailLabel: "E-mail",
    adgangskodeLabel: "Adgangskode",
    adgangskodeHjaelp: "Mindst 8 tegn.",
    alderSpoergsmaal: "Er du 18 år eller ældre?",
    alderJa: "Ja, jeg er 18 år eller ældre",
    alderNej: "Nej, jeg er under 18",
    alderHjaelp: "Vinted kræver, at sælgere er myndige — det gør vi også.",
    logIndKnap: "Log ind",
    opretKnap: "Opret konto",
    // Glemt-kode-flow kræver mail og er parkeret (S39) — indtil da: kontakt.
    glemtKode: "Glemt din adgangskode? Skriv til os, så hjælper vi dig i gang igen.",
    under18:
      "Selja er for sælgere på 18 år eller derover, fordi Vinted kræver det. Du er velkommen tilbage, når du er fyldt 18.",
    alderPaakraevet: "Bekræft at du er 18 år eller ældre for at fortsætte.",
    fejlLogin: "Forkert e-mail eller adgangskode. Prøv igen.",
    fejlSignup:
      "Kontoen kunne ikke oprettes. Måske findes e-mailen allerede — prøv at logge ind i stedet.",
    fejlKortKode: "Adgangskoden skal være mindst 8 tegn.",
    fejlGenerel: "Noget gik galt. Tjek forbindelsen og prøv igen.",
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
    // S31 · dit faste hjem på visualiseringerne. Alle dine annoncer optages i
    // samme bolig, så profilen ligner ét sted — du kan vælge hvilket.
    hjem: {
      titel: "Dit hjem på billederne",
      forklaring:
        "Alle dine visualiseringer optages i det samme hjem, så din profil ligner ét sted. Vælg et fast hjem, eller lad Selja vælge for dig.",
      nuvaerende: (navn: string) => `Nu: ${navn}`,
      automatisk: "Selja vælger",
      automatiskHjaelp: "Vi vælger et fast hjem ud fra din konto.",
      gem: "Gem hjem",
      gemt: "Gemt",
      fejl: "Hjemmet kunne ikke gemmes. Prøv igen.",
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
    fejlForFaaKreditter: (n: number) =>
      `Du skal bruge ${n} kreditter til ${n} billeder. Fyld op, eller vælg færre billeder.`,
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
    faerdigeBilleder: (n: number) =>
      n === 1 ? "1 billede er klar" : `${n} billeder er klar`,
    billederPaaVej: "Dine billeder",
    genererFrame: "Genererer …",
    trinBilledTaeller: (faerdige: number, alle: number) =>
      `${faerdige} af ${alle}`,
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
      "fyld-op": "Fyld op",
    } as Record<string, string>,
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
      faelles: ["Salgsstatistik", "Prioriteret kø — dine annoncer laves først"],
      funktioner: {
        plus: [
          "Favorit-overvågning: op til 25 favoritter med dagligt overblik på mail og prisanbefaling",
        ],
        pro: [
          "Favorit-overvågning uden loft, opdateret løbende, med dynamisk prisanbefaling",
          "Besked når lignende annoncer ændrer pris",
          "Ret prisen på flere annoncer ad gangen",
        ],
      } as Record<string, readonly string[]>,
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
    opdateret: "Senest opdateret: 16. august 2026",
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
          "Netlify: drift af selve siden. Trigger.dev: kører de tunge genereringsjobs — de får kun id'et på din annonce, aldrig dine billeder.",
          "Stripe: betaling, abonnement og kvitteringer. Resend: de mails, vi sender dig.",
          "Google (Gemini) og fal.ai: billedmodellerne, der renser dine fotos og laver visualiseringen. Anthropic (Claude): modellen, der skriver annonceteksten.",
          "Dine billeder sendes kun til modellerne for at lave netop din annonce — aldrig til træning, aldrig til andre kunder.",
        ],
      },
      {
        overskrift: "Overførsel til USA",
        tekst: [
          "Nogle af leverandørerne behandler data i USA. Overførslen sker efter EU's godkendte rammer (EU-U.S. Data Privacy Framework eller standardkontraktbestemmelser), og vi holder en liste over grundlaget pr. leverandør, som du kan bede om at se.",
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
          "Kun det nødvendige: en login-session, når du er logget ind. Ingen sporing, ingen annonce-cookies, ingen tredjeparts-statistik — derfor heller intet cookie-banner.",
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
    dagensForbrug: "Dagens API-forbrug (globalt loft)",
    loftNaaet: "Loftet er nået — nye pipelines afvises indtil midnat (UTC).",
    prDag: "Forbrug pr. dag (7 dage)",
    prBruger: "Forbrug pr. bruger (7 dage)",
    senesteGenereringer: "Seneste genereringer",
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
