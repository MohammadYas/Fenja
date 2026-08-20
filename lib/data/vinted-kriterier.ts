// Vinteds egne kriterier 1:1 (ejer-ordre 2026-08-20) — aflæst direkte fra
// vinted.dk samme dag (farver: /api/v2/colors, størrelser: /api/v2/size_groups).
// Labels må IKKE omformuleres: annoncen skal kunne sættes ind på Vinted uden
// oversættelse. Standskalaen bor i lib/config.ts (vinted.standskala).

/** Vinteds farveliste i Vinteds rækkefølge. "Flere" = flerfarvet. */
export const VINTED_FARVER: readonly { navn: string; hex: string | null }[] = [
  { navn: "Sort", hex: "#000000" },
  { navn: "Grå", hex: "#919191" },
  { navn: "Hvid", hex: "#FFFFFF" },
  { navn: "Flødefarvet", hex: "#F8F8E1" },
  { navn: "Beige", hex: "#F4E0C8" },
  { navn: "Abrikos", hex: "#FFCC98" },
  { navn: "Orange", hex: "#FFA500" },
  { navn: "Koral", hex: "#FE7F5D" },
  { navn: "Rød", hex: "#CC3300" },
  { navn: "Bourgogne", hex: "#AE2E3D" },
  { navn: "Lyserød", hex: "#FF0080" },
  { navn: "Rosa", hex: "#FFCCCA" },
  { navn: "Lilla", hex: "#800080" },
  { navn: "Lyslilla", hex: "#D297D2" },
  { navn: "Lyseblå", hex: "#89CFF0" },
  { navn: "Blå", hex: "#007BC4" },
  { navn: "Marineblå", hex: "#35358D" },
  { navn: "Turkis", hex: "#B7DEE8" },
  { navn: "Mintgrøn", hex: "#A2FFBC" },
  { navn: "Grøn", hex: "#369A3D" },
  { navn: "Mørkegrøn", hex: "#356639" },
  { navn: "Khaki", hex: "#86814A" },
  { navn: "Brun", hex: "#663300" },
  { navn: "Sennepsgul", hex: "#E5B539" },
  { navn: "Gul", hex: "#FFF200" },
  { navn: "Sølv", hex: "#DDDDDD" },
  { navn: "Guld", hex: "#BE9927" },
  { navn: "Flere", hex: null },
  { navn: "Klar", hex: "#F8FDFD" },
];

// Vinteds størrelsesgrupper (titlerne er Vinteds egne, inkl. dobbeltformater)
const KVINDER = [
  "XXXS / 30 / 2",
  "XXS / 32 / 4",
  "XS / 34 / 6",
  "S / 36 / 8",
  "M / 38 / 10",
  "L / 40 / 12",
  "XL / 42 / 14",
  "XXL / 44 / 16",
  "XXXL / 46 / 18",
  "4XL / 48 / 20",
  "5XL / 50 / 22",
  "6XL / 52 / 24",
  "7XL / 54 / 26",
  "8XL / 56 / 28",
  "9XL / 58 / 30",
  "Én størrelse",
] as const;

const MAEND = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "8XL",
  "Én størrelse",
] as const;

const HERREBUKSER = [
  "EU 38 | W23",
  "EU 40 | W24",
  "EU 40 | W25",
  "EU 42 | W26",
  "EU 44 | W27",
  "EU 44 | W28",
  "EU 46 | W29",
  "EU 46 | W30",
  "EU 48 | W31",
  "EU 48 | W32",
  "EU 50 | W33",
  "EU 50 | W34",
  "EU 50 | W35",
  "EU 52 | W36",
  "EU 54 | W38",
  "EU 56 | W40",
  "EU 58 | W42",
  "EU 60 | W44",
  "EU 62 | W46",
  "EU 64 | W48",
  "EU 66 | W50",
  "EU 68 | W52",
  "EU 70 | W54",
] as const;

export type StoerrelsesGruppe = {
  navn: string;
  stoerrelser: readonly string[];
};

/**
 * Størrelsesgrupperne for en tøjdel fra wizard-trin 1.
 * null = fri tekst (fx "Andet" — Vinted har ingen fast liste dér).
 */
export function stoerrelsesGrupperFor(
  kategori: string,
): StoerrelsesGruppe[] | null {
  const k = kategori.toLowerCase();
  if (k.includes("jeans") || k.includes("bukser") || k.includes("shorts")) {
    return [
      { navn: "Kvinder", stoerrelser: KVINDER },
      { navn: "Mænd (EU | W)", stoerrelser: HERREBUKSER },
    ];
  }
  if (k.includes("kjole") || k.includes("nederdel")) {
    return [{ navn: "Kvinder", stoerrelser: KVINDER }];
  }
  if (k.includes("taske")) {
    return [{ navn: "Taske", stoerrelser: ["Én størrelse"] }];
  }
  if (
    k.includes("t-shirt") ||
    k.includes("strik") ||
    k.includes("hoodie") ||
    k.includes("sweatshirt") ||
    k.includes("skjorte") ||
    k.includes("jakke") ||
    k.includes("frakke")
  ) {
    return [
      { navn: "Kvinder", stoerrelser: KVINDER },
      { navn: "Mænd", stoerrelser: MAEND },
    ];
  }
  return null;
}
