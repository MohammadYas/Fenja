// GENERERET af scripts/markedsanalyse/eksporter.ts — redigér ikke i hånden.
// Opdatér med en frisk høst og commit resultatet:
//   npm run analyse:hent && npm run analyse:beregn && npm run analyse:eksport
// Tom liste = prisforslaget kører uden markedslinje (som før M2).

export type Markedsinterval = {
  /** Søgningen tallene stammer fra, fx "ganni kjole" */
  soegetekst: string;
  /** Mærke der skal matche items mærkefelt (normaliseret sammenligning) */
  maerke: string;
  /** Mindst ét af disse ord skal indgå i items kategori */
  matchOrd: string[];
  /** Antal aktive annoncer bag tallene */
  antal: number;
  p25Dkk: number;
  medianDkk: number;
  p75Dkk: number;
  /** ISO-dato for høsten, fx "2026-08-15" */
  hoestetDato: string;
};

export const MARKEDSPRISER: Markedsinterval[] = [
  {
    soegetekst: "carhartt jakke",
    maerke: "Carhartt",
    matchOrd: ["jakke"],
    antal: 192,
    p25Dkk: 309,
    medianDkk: 450,
    p75Dkk: 738,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "rains jakke",
    maerke: "Rains",
    matchOrd: ["jakke","regnjakke"],
    antal: 191,
    p25Dkk: 143,
    medianDkk: 250,
    p75Dkk: 398,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "levi's 501",
    maerke: "Levi's",
    matchOrd: ["jeans","501"],
    antal: 192,
    p25Dkk: 101,
    medianDkk: 150,
    p75Dkk: 211,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "weekday jeans",
    maerke: "Weekday",
    matchOrd: ["jeans"],
    antal: 94,
    p25Dkk: 60,
    medianDkk: 88,
    p75Dkk: 140,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "ganni kjole",
    maerke: "Ganni",
    matchOrd: ["kjole"],
    antal: 191,
    p25Dkk: 175,
    medianDkk: 280,
    p75Dkk: 400,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "gestuz kjole",
    maerke: "Gestuz",
    matchOrd: ["kjole"],
    antal: 191,
    p25Dkk: 89,
    medianDkk: 140,
    p75Dkk: 233,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "adidas samba",
    maerke: "Adidas",
    matchOrd: ["samba"],
    antal: 192,
    p25Dkk: 222,
    medianDkk: 316,
    p75Dkk: 476,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "nike sneakers",
    maerke: "Nike",
    matchOrd: ["sko","sneakers"],
    antal: 192,
    p25Dkk: 86,
    medianDkk: 175,
    p75Dkk: 313,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "cos striktrøje",
    maerke: "COS",
    matchOrd: ["strik","sweater","trøje"],
    antal: 191,
    p25Dkk: 148,
    medianDkk: 242,
    p75Dkk: 456,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "h&m striktrøje",
    maerke: "H&M",
    matchOrd: ["strik","sweater","trøje"],
    antal: 191,
    p25Dkk: 19,
    medianDkk: 30,
    p75Dkk: 50,
    hoestetDato: "2026-08-15",
  },
];
