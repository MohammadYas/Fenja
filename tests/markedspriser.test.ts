import { describe, expect, it } from "vitest";
import type { Markedsinterval } from "../lib/data/markedspriser";
import { findMarkedsinterval } from "../lib/pipeline/markedspriser";
import { byggMarkedspriserModul } from "../scripts/markedsanalyse/eksporter";
import type { Markedsstatistik } from "../scripts/markedsanalyse/analyser";
import { SOEGNINGER } from "../scripts/markedsanalyse/soegninger";

const INTERVALLER: Markedsinterval[] = [
  {
    soegetekst: "levi's 501",
    maerke: "Levi's",
    matchOrd: ["jeans", "501"],
    antal: 179,
    p25Dkk: 101,
    medianDkk: 150,
    p75Dkk: 211,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "h&m striktrøje",
    maerke: "H&M",
    matchOrd: ["strik", "sweater", "trøje"],
    antal: 190,
    p25Dkk: 19,
    medianDkk: 30,
    p75Dkk: 50,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "nike sneakers",
    maerke: "Nike",
    matchOrd: ["sko", "sneakers"],
    antal: 50,
    p25Dkk: 86,
    medianDkk: 175,
    p75Dkk: 313,
    hoestetDato: "2026-08-15",
  },
  {
    soegetekst: "nike sneakers (større stikprøve)",
    maerke: "Nike",
    matchOrd: ["sneakers"],
    antal: 300,
    p25Dkk: 90,
    medianDkk: 180,
    p75Dkk: 320,
    hoestetDato: "2026-08-15",
  },
];

describe("findMarkedsinterval (M2/D-4)", () => {
  it("matcher mærke normaliseret — apostrof og &-tegn er ligegyldige", () => {
    expect(findMarkedsinterval("Levis", "jeans", INTERVALLER)?.soegetekst).toBe("levi's 501");
    expect(findMarkedsinterval("levi's", "Jeans", INTERVALLER)?.soegetekst).toBe("levi's 501");
    expect(findMarkedsinterval("HM", "striktrøje", INTERVALLER)?.maerke).toBe("H&M");
    expect(findMarkedsinterval("h&m", "sweater", INTERVALLER)?.maerke).toBe("H&M");
  });

  it("kræver at mindst ét matchord indgår i kategorien", () => {
    expect(findMarkedsinterval("Levi's", "jakke", INTERVALLER)).toBeNull();
    expect(findMarkedsinterval("H&M", "kjole", INTERVALLER)).toBeNull();
    // "striktrøje" indeholder "trøje" — delordsmatch er nok
    expect(findMarkedsinterval("H&M", "striktrøje", INTERVALLER)).not.toBeNull();
  });

  it("vælger intervallet med flest annoncer bag ved flere kandidater", () => {
    expect(findMarkedsinterval("Nike", "sneakers", INTERVALLER)?.antal).toBe(300);
  });

  it("returnerer null for ukendt mærke, tomme felter og tom liste", () => {
    expect(findMarkedsinterval("Prada", "kjole", INTERVALLER)).toBeNull();
    expect(findMarkedsinterval("", "jeans", INTERVALLER)).toBeNull();
    expect(findMarkedsinterval("Nike", "", INTERVALLER)).toBeNull();
    expect(findMarkedsinterval("Nike", "sneakers", [])).toBeNull();
  });
});

describe("byggMarkedspriserModul (eksport)", () => {
  const statistik: Markedsstatistik = {
    genereretTs: 1_786_807_340,
    antalAnnoncer: 400,
    soegninger: [
      {
        soegning: "levis-501",
        soegetekst: "levi's 501",
        kategori: "Jeans",
        totaltUdbud: 960,
        stat: {
          antal: 179,
          medianPris: 150,
          p25Pris: 100.6,
          p75Pris: 211.4,
          medianFavoritterPrDag: 0.12,
          andelNyMedPrismaerke: 0.02,
        },
        prStand: [],
      },
      {
        soegning: "lille-stikproeve",
        soegetekst: "sjældent mærke",
        kategori: "Andet",
        totaltUdbud: 12,
        stat: {
          antal: 12,
          medianPris: 500,
          p25Pris: 400,
          p75Pris: 600,
          medianFavoritterPrDag: null,
          andelNyMedPrismaerke: 0,
        },
        prStand: [],
      },
    ],
  };

  it("eksporterer kun søgninger med matchfelter og nok stikprøve, afrundet til hele kr.", () => {
    const modul = byggMarkedspriserModul(statistik, SOEGNINGER);
    expect(modul).toContain("GENERERET");
    expect(modul).toContain('soegetekst: "levi\'s 501"');
    expect(modul).toContain("p25Dkk: 101");
    expect(modul).toContain("p75Dkk: 211");
    expect(modul).toContain('hoestetDato: "2026-08-15"');
    // Under MIN_ANTAL og uden opsætning i SOEGNINGER → udeladt
    expect(modul).not.toContain("sjældent mærke");
  });

  it("uden kvalificerede søgninger er listen tom men gyldig", () => {
    const modul = byggMarkedspriserModul(statistik, [], 30);
    expect(modul).toContain("MARKEDSPRISER: Markedsinterval[] = [\n\n]");
  });
});
