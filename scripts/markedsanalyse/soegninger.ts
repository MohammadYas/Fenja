import type { Soegning } from "./faelles";

// Standard-søgninger: mærke × kategori-kombinationer der matcher målgruppen
// (danske Vinted-sælgere, jf. MAERKER i lib/data/maerker.ts). Redigér frit —
// navn er slug til filnavne, kategori er rapportens overskrift. maerke og
// matchOrd bruges af eksporter.ts (M2) til at koble intervallet til items
// i prisforslaget; udelades de, eksporteres søgningen ikke.
export const SOEGNINGER: Soegning[] = [
  {
    navn: "ganni-kjole",
    soegetekst: "ganni kjole",
    kategori: "Kjoler",
    maerke: "Ganni",
    matchOrd: ["kjole"],
  },
  {
    navn: "gestuz-kjole",
    soegetekst: "gestuz kjole",
    kategori: "Kjoler",
    maerke: "Gestuz",
    matchOrd: ["kjole"],
  },
  {
    navn: "levis-501",
    soegetekst: "levi's 501",
    kategori: "Jeans",
    maerke: "Levi's",
    matchOrd: ["jeans", "501"],
  },
  {
    navn: "weekday-jeans",
    soegetekst: "weekday jeans",
    kategori: "Jeans",
    maerke: "Weekday",
    matchOrd: ["jeans"],
  },
  {
    navn: "carhartt-jakke",
    soegetekst: "carhartt jakke",
    kategori: "Jakker",
    maerke: "Carhartt",
    matchOrd: ["jakke"],
  },
  {
    navn: "rains-jakke",
    soegetekst: "rains jakke",
    kategori: "Jakker",
    maerke: "Rains",
    matchOrd: ["jakke", "regnjakke"],
  },
  {
    navn: "cos-strik",
    soegetekst: "cos striktrøje",
    kategori: "Strik",
    maerke: "COS",
    matchOrd: ["strik", "sweater", "trøje"],
  },
  {
    navn: "hm-strik",
    soegetekst: "h&m striktrøje",
    kategori: "Strik",
    maerke: "H&M",
    matchOrd: ["strik", "sweater", "trøje"],
  },
  {
    navn: "adidas-samba",
    soegetekst: "adidas samba",
    kategori: "Sko",
    maerke: "Adidas",
    matchOrd: ["samba"],
  },
  {
    navn: "nike-sneakers",
    soegetekst: "nike sneakers",
    kategori: "Sko",
    maerke: "Nike",
    matchOrd: ["sko", "sneakers"],
  },
];
