import type { Soegning } from "./faelles";

// Standard-søgninger: mærke × kategori-kombinationer der matcher målgruppen
// (danske Vinted-sælgere, jf. MAERKER i lib/data/maerker.ts). Redigér frit —
// navn er slug til filnavne, kategori er rapportens overskrift.
export const SOEGNINGER: Soegning[] = [
  { navn: "ganni-kjole", soegetekst: "ganni kjole", kategori: "Kjoler" },
  { navn: "gestuz-kjole", soegetekst: "gestuz kjole", kategori: "Kjoler" },
  { navn: "levis-501", soegetekst: "levi's 501", kategori: "Jeans" },
  { navn: "weekday-jeans", soegetekst: "weekday jeans", kategori: "Jeans" },
  { navn: "carhartt-jakke", soegetekst: "carhartt jakke", kategori: "Jakker" },
  { navn: "rains-jakke", soegetekst: "rains jakke", kategori: "Jakker" },
  { navn: "cos-strik", soegetekst: "cos striktrøje", kategori: "Strik" },
  { navn: "hm-strik", soegetekst: "h&m striktrøje", kategori: "Strik" },
  { navn: "adidas-samba", soegetekst: "adidas samba", kategori: "Sko" },
  { navn: "nike-sneakers", soegetekst: "nike sneakers", kategori: "Sko" },
];
