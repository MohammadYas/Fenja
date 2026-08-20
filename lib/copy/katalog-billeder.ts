// Katalog-billedserien til forsidens annonce-strøm (ejer-ordre 2026-08-19:
// mange flere billeder, animationsrigt). Alle filer i public/eksempler/katalog/
// er AI-genererede (gemini-3-pro-image, 2026-08-19; prompts i
// scripts/katalog-prompts-data.ts). Alt-tekster er neutrale (STATUS-beslutning).
// FØR-billedet (p13) indgår bevidst IKKE i strømmen — det hører til
// før/efter-sammenhænge.

export type KatalogBillede = { src: string; alt: string };

const sti = (navn: string) => `/eksempler/katalog/${navn}.webp`;

// Rækkefølgen er kurateret: person-motiver og produktvinkler skiftevis,
// så strømmen varierer i rytme. Delt i to rækker (modsat retning).
// Ejer-ordre 2026-08-19: p1 (tanktop) er taget ud af strømmen; p3 fører an.
export const katalogRaekkeA: KatalogBillede[] = [
  { src: sti("p3-entre-overshirt-mand"), alt: "Spejlselfie i entré: olivengrøn ulds-overshirt og mørke jeans" },
  { src: sti("kjole-gulv"), alt: "Salviegrøn midi-kjole lagt frem på trægulv" },
  { src: sti("jeans-detalje"), alt: "Nærbillede af denimlinning med metalknap og syninger" },
  { src: sti("p4-sovevaerelse-kjole"), alt: "Spejlselfie i soveværelse: salviegrøn midi-kjole" },
  { src: sti("striktroeje-stativ"), alt: "Marineblå striktrøje på bøjle på tøjstativ" },
  { src: sti("p7-entre-taske"), alt: "Spejlfoto i entré: sort skuldertaske i læder" },
  { src: sti("jakke-gulv"), alt: "Olivengrøn ulds-overshirt lagt frem på trægulv" },
  { src: sti("p9-stue-strik"), alt: "Spejlselfie i stue: beige chunky striktrøje og mørke jeans" },
  { src: sti("taske-detalje"), alt: "Nærbillede af taskelås og læderstruktur" },
  { src: sti("p11-flatlay-seng"), alt: "Striktrøje og jeans lagt frem på seng med hørsengetøj" },
  { src: sti("kjole-stativ"), alt: "Salviegrøn midi-kjole på bøjle på tøjstativ" },
  { src: sti("p5-walkin-jeans"), alt: "Spejlfoto af mellemblå straight-leg jeans" },
  { src: sti("striktroeje-detalje"), alt: "Nærbillede af ribkant og masker på striktrøje" },
  { src: sti("p10-boejle-skjorte"), alt: "Lyseblå skjorte på bøjle på klædeskabsdør" },
  { src: sti("taske-gulv"), alt: "Sort skuldertaske fotograferet på trægulv" },
  { src: sti("p14-efter-strik"), alt: "Renset foto af mørkeblå striktrøje på neutral baggrund" },
];

export const katalogRaekkeB: KatalogBillede[] = [
  { src: sti("p2-entre-cardigan"), alt: "Spejlselfie i entré: taupegrå cardigan og hvide jeans" },
  { src: sti("jeans-gulv"), alt: "Mellemblå jeans lagt frem på trægulv" },
  { src: sti("p6-vaerelse-strik-mand"), alt: "Spejlselfie: marineblå striktrøje med fin rib" },
  { src: sti("kjole-detalje"), alt: "Nærbillede af stropper og fald på salviegrøn kjole" },
  { src: sti("p8-opgang-frakke-mand"), alt: "Spejlselfie i opgang: camel uldfrakke" },
  { src: sti("jeans-stativ"), alt: "Mellemblå jeans på bøjle på tøjstativ" },
  { src: sti("p12-closeup-denim"), alt: "Hånd viser denimlinning med metalknap" },
  { src: sti("striktroeje-gulv"), alt: "Marineblå striktrøje lagt frem på trægulv" },
  { src: sti("jakke-stativ"), alt: "Olivengrøn ulds-overshirt på bøjle på tøjstativ" },
  { src: sti("kjole-bagside"), alt: "Bagsiden af salviegrøn midi-kjole på bøjle" },
  { src: sti("taske-stativ"), alt: "Sort skuldertaske hængende i rem på tøjstativ" },
  { src: sti("jakke-detalje"), alt: "Nærbillede af krave, knapper og brystlomme på ulds-overshirt" },
  { src: sti("jeans-bagside"), alt: "Bagsiden af mellemblå jeans på bøjle" },
  { src: sti("striktroeje-bagside"), alt: "Bagsiden af marineblå striktrøje på bøjle" },
  { src: sti("jakke-bagside"), alt: "Bagsiden af olivengrøn ulds-overshirt på bøjle" },
  { src: sti("taske-bagside"), alt: "Bagsiden af sort skuldertaske mod hvid væg" },
];
