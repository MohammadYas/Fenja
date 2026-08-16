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
    saldo: (antal: number) =>
      antal === 1
        ? "1 annonce tilbage"
        : `${formaterKreditTal(antal)} annoncer tilbage`,
  },
  logInd: {
    titel: "Opret dig eller log ind",
    forklaring:
      "Skriv din e-mail, så sender vi et link, der logger dig ind. Er du ny, opretter linket samtidig din konto uden adgangskode. Når du er logget ind, kan du købe kreditter og lave din annonce.",
    emailLabel: "E-mail",
    alderSpoergsmaal: "Er du 18 år eller ældre?",
    alderJa: "Ja, jeg er 18 år eller ældre",
    alderNej: "Nej, jeg er under 18",
    alderHjaelp: "Vinted kræver, at sælgere er myndige — det gør vi også.",
    sendLink: "Send mig et link",
    linkSendt: (email: string) =>
      `Vi har sendt et link til ${email}. Åbn mailen på denne telefon og tryk på linket.`,
    under18:
      "Selja er for sælgere på 18 år eller derover, fordi Vinted kræver det. Du er velkommen tilbage, når du er fyldt 18.",
    alderPaakraevet: "Bekræft at du er 18 år eller ældre for at fortsætte.",
    fejl: "Linket kunne ikke sendes. Tjek at e-mailen er rigtig, og prøv igen.",
  },
  konto: {
    titel: "Konto",
    emailLabel: "E-mail",
    saldoLabel: "Kreditsaldo",
    koebshistorik: "Købshistorik",
    ingenKoeb: "Ingen køb endnu. Køb en pakke under Kreditter, når du er klar.",
    koebLinje: (antal: number, dato: string) => `${antal} kreditter · ${dato}`,
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
    // B-9 batch: pipelinen kører færdig i baggrunden — man kan fotografere videre
    batchTekst:
      "Du behøver ikke vente her. Annoncen bliver færdig i baggrunden, og du finder den på oversigten.",
    batchKnap: "Fotografér det næste imens",
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
    pakkeNavn: (antal: number) => `Selja · ${antal} annoncer`,
    // Pakkenavne (pricing v3.0) — id'erne fra lib/config.ts
    pakkeNavne: {
      proev: "Prøv",
      saelger: "Sælger",
      bunke: "Bunke",
      "fyld-op": "Fyld op",
    } as Record<string, string>,
    anbefalet: "Anbefalet",
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
    // Udløb vises ærligt: den generelle regel + den konkrete næste dato
    udloebNote: "Kreditter gælder 12 måneder fra køb.",
    udloebNaeste: (antal: number, dato: string) =>
      antal === 1
        ? `1 af dine annoncer udløber ${dato}.`
        : `${formaterKreditTal(antal)} af dine annoncer udløber ${dato}.`,
    // Top-up-kortet — vises kun når saldoen er lav. Konkret, intet pres.
    topUp: {
      titel: "Fyld op",
      linje: (antal: number, pris: number) => `${antal} annoncer mere · ${pris} kr.`,
      forklaring: "Din saldo er lav. Samme kreditter som pakkerne — uden binding.",
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
    lead: "Du køber kun det, du bruger — og jo mere du sælger, jo mindre koster hver annonce. Kreditter gælder 12 måneder.",
    stempel: "1 kredit = 1 annonce",
    pakkerTitel: "Kreditpakker",
    // Abonnementer (pricing v3.0) — vises på priser-siden; køb åbner senere
    abonnement: {
      titel: "Abonnementer",
      lead: "Til sælgere med fast flow. Kvoten fyldes hver måned, og ubrugte annoncer følger med til næste måned.",
      stempel: "Åbner snart",
      navne: { plus: "Plus", pro: "Pro" } as Record<string, string>,
      prMd: "pr. måned",
      prisPrAar: (pris: number) => `eller ${pris} kr. pr. år — to måneder sparet`,
      annoncerPrMd: (antal: number) => `${antal} annoncer hver måned`,
      lavestePris: "Lavest pris pr. annonce",
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
        overskrift: "1 kredit = 1 færdig annonce",
        tekst: "Rensede billeder, mærket visualisering og annoncetekst — alt sammen for én kredit.",
      },
      {
        overskrift: "Du betaler først ved levering",
        tekst: "Kreditten trækkes, når annoncen er klar. Fejler visualiseringen, leverer vi resten og sætter kreditten tilbage automatisk.",
      },
      {
        overskrift: "Kreditter gælder 12 måneder",
        tekst: "Køb en pakke i dag, brug den henover året. Udløbsdatoen står altid på din kreditside — intet forsvinder, uden at du kan se hvornår.",
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
        spoergsmaal: "Skal jeg have en adgangskode?",
        svar: "Nej. Du logger ind med et link, vi sender til din e-mail. Ingen adgangskode at glemme eller lække.",
      },
    ],
    ctaTitel: "Køb en pakke og gå i gang",
    ctaKnap: "Opret dig og køb kreditter",
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
    opdateret: "Senest opdateret: 14. august 2026",
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
          "1 kredit svarer til 1 leveret annonce. Kreditter trækkes først, når leverancen er færdig. Fejler visualiseringen, leverer vi resten og sætter kreditten for visualiseringen tilbage automatisk.",
          "Betaling sker via Stripe, som også sender din kvittering. Priserne er i danske kroner og inklusive moms. Købte kreditter gælder 12 måneder fra købsdatoen — udløbsdatoen vises på din kreditside.",
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
