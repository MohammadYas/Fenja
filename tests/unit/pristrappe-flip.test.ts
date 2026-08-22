import { describe, expect, it } from "vitest";
import { bygFlipBeregner, FLIP_ANTAL, MAKS_KOEBSANDEL } from "@/lib/salg/flip";
import { bygPrisTrappe, MAKS_TRAPPER } from "@/lib/salg/pristrappe";

// Pris-trappe (alle abonnenter) + flip-beregner (KUN Pro) — 22/8.

const NU = new Date("2026-08-22T12:00:00Z"); // august

describe("bygPrisTrappe", () => {
  // Levi's jeans findes i den committede markedshøst
  const jeans = {
    id: "i1",
    titel: "Levi's 501",
    maerke: "Levi's",
    kategori: "Jeans",
    status: "active" as const,
    leveretAt: "2026-08-01T12:00:00Z", // 21 dage før NU
    prisTilDkk: 10_000,
  };

  it("bygger faldende trin fra egen pris mod markedets median og p25", () => {
    const [punkt] = bygPrisTrappe([jeans], NU);
    expect(punkt).toBeDefined();
    expect(punkt!.trin.length).toBeGreaterThanOrEqual(2);
    expect(punkt!.trin[0]!.prisDkk).toBe(10_000);
    for (let i = 1; i < punkt!.trin.length; i++) {
      expect(punkt!.trin[i]!.prisDkk).toBeLessThan(punkt!.trin[i - 1]!.prisDkk);
      expect(punkt!.trin[i]!.fraDag).toBeGreaterThan(punkt!.trin[i - 1]!.fraDag);
    }
  });

  it("peger på det trin, annoncen er nået til efter liggetiden", () => {
    const [punkt] = bygPrisTrappe([jeans], NU);
    expect(punkt!.dagePaaTrappen).toBe(21);
    // 21 dage: forbi trin 14, men ikke trin 28
    expect(punkt!.trin[punkt!.aktueltTrin]!.fraDag).toBe(14);
  });

  it("annonce der allerede ligger i bunden får ingen trappe", () => {
    expect(bygPrisTrappe([{ ...jeans, prisTilDkk: 1 }], NU)).toHaveLength(0);
  });

  it("springer solgte, kladder og annoncer uden marked over", () => {
    expect(
      bygPrisTrappe(
        [
          { ...jeans, status: "sold" as const },
          { ...jeans, id: "kladde", status: "draft" as const },
          { ...jeans, id: "ukendt", maerke: "UkendtMærkeXYZ" },
        ],
        NU,
      ),
    ).toHaveLength(0);
  });

  it("længst liggende først, og aldrig flere end loftet", () => {
    const mange = Array.from({ length: MAKS_TRAPPER + 2 }, (_, i) => ({
      ...jeans,
      id: `i${i}`,
      titel: `Jeans ${i}`,
      leveretAt: new Date(NU.getTime() - i * 86_400_000).toISOString(),
    }));
    const punkter = bygPrisTrappe(mange, NU);
    expect(punkter).toHaveLength(MAKS_TRAPPER);
    expect(punkter[0]!.dagePaaTrappen).toBeGreaterThanOrEqual(
      punkter[punkter.length - 1]!.dagePaaTrappen ?? 0,
    );
  });
});

describe("bygFlipBeregner", () => {
  it("giver højst FLIP_ANTAL punkter med loft, gevinst og sæsontekst", () => {
    const punkter = bygFlipBeregner(NU);
    expect(punkter.length).toBeGreaterThan(0);
    expect(punkter.length).toBeLessThanOrEqual(FLIP_ANTAL);
    for (const punkt of punkter) {
      expect(punkt.maksKoebDkk).toBeGreaterThan(0);
      expect(punkt.maksKoebDkk % 5).toBe(0);
      expect(punkt.maksKoebDkk).toBeLessThanOrEqual(
        punkt.medianDkk * MAKS_KOEBSANDEL,
      );
      expect(punkt.gevinstDkk).toBe(punkt.medianDkk - punkt.maksKoebDkk);
      expect(punkt.saesonTekst.length).toBeGreaterThan(0);
    }
  });

  it("i sæson sorteres først, dernæst størst gevinst", () => {
    const punkter = bygFlipBeregner(NU);
    let saesonSlut = false;
    for (const punkt of punkter) {
      if (!punkt.iSaeson) saesonSlut = true;
      else expect(saesonSlut, "i sæson må ikke komme efter uden for sæson").toBe(false);
    }
    const iSaeson = punkter.filter((p) => p.iSaeson);
    for (let i = 1; i < iSaeson.length; i++) {
      expect(iSaeson[i]!.gevinstDkk).toBeLessThanOrEqual(iSaeson[i - 1]!.gevinstDkk);
    }
  });
});
