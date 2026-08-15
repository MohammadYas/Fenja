import { describe, expect, it } from "vitest";
import {
  beregnGruppe,
  dedupPaaId,
  favoritterPrDag,
  formaterKr,
  formaterTal,
  kvartil,
  median,
  sanerItem,
  STAND_NY_MED_PRISMAERKE,
  type MarkedsItem,
  type Snapshot,
  type Soegning,
} from "../scripts/markedsanalyse/faelles";
import { beregnMarkedsstatistik } from "../scripts/markedsanalyse/analyser";
import { byggRapport } from "../scripts/markedsanalyse/rapport";

const SOEGNING: Soegning = { navn: "ganni-kjole", soegetekst: "ganni kjole", kategori: "Kjoler" };
const NU = 1_700_000_000;

// Realistisk råt katalog-item — inkl. sælgerfelter der SKAL smides væk
const raatItem = {
  id: 9669755103,
  title: "Ganni kjole",
  price: { amount: "550.0", currency_code: "DKK" },
  total_item_price: { amount: "582.5", currency_code: "DKK" },
  brand_title: "Ganni",
  size_title: "XL / 42 / 14",
  status: "Ny uden prismærker",
  favourite_count: 7,
  view_count: 120,
  photo: { high_resolution: { timestamp: NU - 5 * 86_400 } },
  user: { id: 198111642, login: "sælger-login", profile_url: "https://…" },
  path: "/items/9669755103-ganni-kjole",
};

function lavItem(delvis: Partial<MarkedsItem>): MarkedsItem {
  return {
    id: 1,
    titel: "Test",
    prisDkk: 100,
    totalPrisDkk: null,
    maerke: "Ganni",
    stoerrelse: "M",
    stand: "God stand",
    favoritter: 0,
    visninger: 0,
    oprettetTs: NU - 10 * 86_400,
    soegning: SOEGNING.navn,
    kategori: SOEGNING.kategori,
    hentetTs: NU,
    ...delvis,
  };
}

describe("sanerItem (privatliv + parsing)", () => {
  it("parser varefelterne og smider ALLE sælgerfelter væk", () => {
    const item = sanerItem(raatItem, SOEGNING, NU);
    expect(item).not.toBeNull();
    expect(item?.prisDkk).toBe(550);
    expect(item?.totalPrisDkk).toBe(582.5);
    expect(item?.maerke).toBe("Ganni");
    expect(item?.stand).toBe("Ny uden prismærker");
    expect(item?.oprettetTs).toBe(NU - 5 * 86_400);
    // Intet personhenførbart må overleve saneringen
    const serialiseret = JSON.stringify(item);
    expect(serialiseret).not.toContain("sælger-login");
    expect(serialiseret).not.toContain("198111642");
    expect(serialiseret).not.toContain("user");
  });

  it("afviser andre valutaer end DKK", () => {
    const eur = { ...raatItem, price: { amount: "75.0", currency_code: "EUR" } };
    expect(sanerItem(eur, SOEGNING, NU)).toBeNull();
  });

  it("afviser items uden id eller pris", () => {
    expect(sanerItem({ title: "uden id" }, SOEGNING, NU)).toBeNull();
    expect(sanerItem({ id: 1 }, SOEGNING, NU)).toBeNull();
    expect(sanerItem("ikke et objekt", SOEGNING, NU)).toBeNull();
  });

  it("tåler manglende valgfrie felter", () => {
    const minimal = { id: 2, price: { amount: "80.0", currency_code: "DKK" } };
    const item = sanerItem(minimal, SOEGNING, NU);
    expect(item?.favoritter).toBe(0);
    expect(item?.maerke).toBeNull();
    expect(item?.oprettetTs).toBeNull();
  });
});

describe("statistik", () => {
  it("median og kvartiler med interpolation", () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
    expect(kvartil([10, 20, 30, 40], 0.25)).toBe(17.5);
    expect(kvartil([5], 0.75)).toBe(5);
  });

  it("dedup beholder nyeste observation af samme annonce", () => {
    const gammel = lavItem({ id: 7, prisDkk: 100, hentetTs: NU - 100 });
    const ny = lavItem({ id: 7, prisDkk: 90, hentetTs: NU });
    const resultat = dedupPaaId([gammel, ny, lavItem({ id: 8 })]);
    expect(resultat).toHaveLength(2);
    expect(resultat.find((i) => i.id === 7)?.prisDkk).toBe(90);
  });

  it("favoritter pr. dag kræver mindst ét døgns alder", () => {
    const frisk = lavItem({ favoritter: 10, oprettetTs: NU - 3600 });
    const gammel = lavItem({ favoritter: 10, oprettetTs: NU - 5 * 86_400 });
    expect(favoritterPrDag(frisk, NU)).toBeNull();
    expect(favoritterPrDag(gammel, NU)).toBe(2);
    expect(favoritterPrDag(lavItem({ oprettetTs: null }), NU)).toBeNull();
  });

  it("gruppe-statistik: andel ny med prismærke og medianpris", () => {
    const stat = beregnGruppe(
      [
        lavItem({ prisDkk: 100, stand: STAND_NY_MED_PRISMAERKE }),
        lavItem({ id: 2, prisDkk: 200 }),
        lavItem({ id: 3, prisDkk: 300 }),
        lavItem({ id: 4, prisDkk: 400 }),
      ],
      NU,
    );
    expect(stat?.antal).toBe(4);
    expect(stat?.medianPris).toBe(250);
    expect(stat?.andelNyMedPrismaerke).toBe(0.25);
    expect(beregnGruppe([], NU)).toBeNull();
  });
});

describe("markedsstatistik + rapport", () => {
  const snapshots: Snapshot[] = [
    {
      soegning: SOEGNING,
      side: 1,
      hentetTs: NU,
      totaltUdbud: 960,
      items: [
        lavItem({ id: 1, prisDkk: 300, favoritter: 4 }),
        lavItem({ id: 2, prisDkk: 500 }),
      ],
    },
    {
      soegning: SOEGNING,
      side: 2,
      hentetTs: NU,
      totaltUdbud: 955,
      items: [lavItem({ id: 2, prisDkk: 500 }), lavItem({ id: 3, prisDkk: 700 })],
    },
  ];

  it("aggregerer på tværs af snapshots med dedup og størst observeret udbud", () => {
    const statistik = beregnMarkedsstatistik(snapshots, NU);
    expect(statistik.antalAnnoncer).toBe(3);
    const gruppe = statistik.soegninger[0];
    expect(gruppe?.totaltUdbud).toBe(960);
    expect(gruppe?.stat.medianPris).toBe(500);
    expect(gruppe?.prStand[0]?.stand).toBe("God stand");
  });

  it("rapporten er dansk, ærlig om udbudspriser og uden sælgerdata", () => {
    const rapport = byggRapport(beregnMarkedsstatistik(snapshots, NU));
    expect(rapport).toContain("udbudspriser");
    expect(rapport).toContain("| **ganni kjole** |");
    expect(rapport).toContain("500 kr.");
    expect(rapport).not.toContain("login");
  });
});

describe("dansk formatering", () => {
  it("kroner uden decimaler, tal med komma", () => {
    expect(formaterKr(1234.4)).toBe("1.234 kr.");
    expect(formaterTal(0.416, 2)).toBe("0,42");
  });
});
