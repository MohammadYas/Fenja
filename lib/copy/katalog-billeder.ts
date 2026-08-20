// Katalog-billedserien (ejer-ordrer 2026-08-19/20). Selve fil-listen findes
// nu AUTOMATISK fra public/eksempler/katalog/ (lib/katalog-server.ts), så nye
// billeder kommer med uden kodeændring. Her bor kun alt-teksterne (neutrale,
// STATUS-beslutning) og den kuraterede rækkefølge. Alle filer er
// AI-genererede (gemini-3-pro-image; prompts i scripts/katalog-prompts-data.ts).

export type KatalogBillede = { src: string; alt: string };

// Neutral fallback-alt til nye filer uden kurateret tekst
export const FALLBACK_ALT = "Tøjfoto fra katalogserien";

// FØR-billederne indgår aldrig i strøm/slides — de hører til før/efter-panelet
export const EKSKLUDERET = [
  "p13-foer-billede",
  "p16-foer-kjole",
  "p17-foer-jeans",
  "p18-foer-cardigan",
];

// p1 er taget ud af visningerne (ejer-ordre 19/8) men ligger stadig på disk
export const SKJULTE = ["p1-sovevaerelse-tanktop"];

export const KATALOG_ALTS: Record<string, string> = {
  "p1-sovevaerelse-tanktop": "Spejlselfie i soveværelse: hvid tanktop, sort vest og lyse jeans",
  "p2-entre-cardigan": "Spejlselfie i entré: taupegrå cardigan og hvide jeans",
  "p3-entre-overshirt-mand": "Spejlselfie i entré: olivengrøn ulds-overshirt og mørke jeans",
  "p4-sovevaerelse-kjole": "Spejlselfie i soveværelse: salviegrøn midi-kjole",
  "p5-walkin-jeans": "Spejlfoto af mellemblå straight-leg jeans",
  "p6-vaerelse-strik-mand": "Spejlselfie: marineblå striktrøje med fin rib",
  "p7-entre-taske": "Spejlfoto i entré: sort skuldertaske i læder",
  "p8-opgang-frakke-mand": "Spejlselfie i opgang: camel uldfrakke",
  "p9-stue-strik": "Spejlselfie i stue: beige chunky striktrøje og mørke jeans",
  "p10-boejle-skjorte": "Lyseblå skjorte på bøjle på klædeskabsdør",
  "p11-flatlay-seng": "Striktrøje og jeans lagt frem på seng med hørsengetøj",
  "p12-closeup-denim": "Hånd viser denimlinning med metalknap",
  "p14-efter-strik": "Renset foto af mørkeblå striktrøje på neutral baggrund",
  "kjole-gulv": "Salviegrøn midi-kjole lagt frem på trægulv",
  "kjole-stativ": "Salviegrøn midi-kjole på bøjle på tøjstativ",
  "kjole-bagside": "Bagsiden af salviegrøn midi-kjole på bøjle",
  "kjole-detalje": "Nærbillede af stropper og fald på salviegrøn kjole",
  "jeans-gulv": "Mellemblå jeans lagt frem på trægulv",
  "jeans-stativ": "Mellemblå jeans foldet over bøjle på tøjstativ",
  "jeans-bagside": "Bagsiden af mellemblå jeans på bøjle",
  "jeans-detalje": "Nærbillede af denimlinning med metalknap og syninger",
  "striktroeje-gulv": "Marineblå striktrøje lagt frem på trægulv",
  "striktroeje-stativ": "Marineblå striktrøje på bøjle på tøjstativ",
  "striktroeje-bagside": "Bagsiden af marineblå striktrøje på bøjle",
  "striktroeje-detalje": "Nærbillede af ribkant og masker på striktrøje",
  "jakke-gulv": "Olivengrøn ulds-overshirt lagt frem på trægulv",
  "jakke-stativ": "Olivengrøn ulds-overshirt på bøjle på tøjstativ",
  "jakke-bagside": "Bagsiden af olivengrøn ulds-overshirt på bøjle",
  "jakke-detalje": "Nærbillede af krave, knapper og brystlomme på ulds-overshirt",
  "taske-gulv": "Sort skuldertaske fotograferet på trægulv",
  "taske-stativ": "Sort skuldertaske hængende i rem på tøjstativ",
  "taske-bagside": "Bagsiden af sort skuldertaske mod hvid væg",
  "taske-detalje": "Nærbillede af taskelås og læderstruktur",
};

// Kurateret rækkefølge: person-motiver og produktvinkler skiftevis, så både
// slides og strøm varierer i rytme. Nye (ukendte) filer lægges bagest.
export const KURATERET_RAEKKEFOELGE: string[] = [
  "p3-entre-overshirt-mand",
  "kjole-gulv",
  "p2-entre-cardigan",
  "jeans-detalje",
  "p4-sovevaerelse-kjole",
  "striktroeje-stativ",
  "p7-entre-taske",
  "jakke-gulv",
  "p9-stue-strik",
  "taske-detalje",
  "p6-vaerelse-strik-mand",
  "kjole-stativ",
  "p5-walkin-jeans",
  "striktroeje-detalje",
  "p10-boejle-skjorte",
  "taske-gulv",
  "p8-opgang-frakke-mand",
  "jeans-gulv",
  "p11-flatlay-seng",
  "kjole-detalje",
  "p12-closeup-denim",
  "striktroeje-gulv",
  "p14-efter-strik",
  "jakke-stativ",
  "kjole-bagside",
  "jeans-stativ",
  "taske-stativ",
  "jakke-detalje",
  "jeans-bagside",
  "striktroeje-bagside",
  "jakke-bagside",
  "taske-bagside",
];
