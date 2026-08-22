import { describe, expect, it } from "vitest";
import {
  bygAnnonceDoktor,
  DOKTOR_LIGGETID_DAGE,
  DOKTOR_PLUS_ANTAL,
} from "@/lib/salg/doktor";

// Annonce-doktor (22/8): sundhedstjek pr. aktiv annonce — score + konkrete råd.

const NU = new Date("2026-08-22T12:00:00Z"); // august = jeans-sæson

// Levi's jeans findes i den committede markedshøst
const sundJeans = {
  id: "i1",
  titel: "Levi's 501 mellemblå jeans W32",
  maerke: "Levi's",
  kategori: "Jeans",
  status: "active" as const,
  leveretAt: "2026-08-20T12:00:00Z", // 2 dage — frisk
  prisTilDkk: 150, // midt i markedet
  fotoRoller: ["full", "back", "label"] as const,
};

describe("bygAnnonceDoktor", () => {
  it("en gennemarbejdet annonce i sæson scorer højt og får ingen råd", () => {
    const [punkt] = bygAnnonceDoktor([sundJeans], NU);
    expect(punkt).toBeDefined();
    expect(punkt!.score).toBe(100);
    expect(punkt!.raad).toHaveLength(0);
  });

  it("overpris, manglende fotos og mærkeløs titel koster point og giver konkrete råd", () => {
    const [punkt] = bygAnnonceDoktor(
      [
        {
          ...sundJeans,
          titel: "blå bukser",
          prisTilDkk: 10_000,
          fotoRoller: ["full"],
          leveretAt: "2026-06-01T12:00:00Z", // ligget længe
        },
      ],
      NU,
    );
    expect(punkt!.score).toBeLessThan(50);
    const samlet = punkt!.raad.join(" ");
    expect(samlet).toContain("øvre kvartil");
    expect(samlet).toContain("bagsidefoto");
    expect(samlet).toContain("vaskemærket");
    expect(samlet).toContain("Levi's");
    expect(samlet).toContain("dage");
    // Vigtigste råd (størst vægt = prisen) står først
    expect(punkt!.raad[0]).toContain("kvartil");
  });

  it("liggetids-grænsen rammer præcist ved konstanten", () => {
    const gammelDato = new Date(
      NU.getTime() - DOKTOR_LIGGETID_DAGE * 86_400_000,
    ).toISOString();
    const [punkt] = bygAnnonceDoktor([{ ...sundJeans, leveretAt: gammelDato }], NU);
    expect(punkt!.raad.join(" ")).toContain("genopslå");
  });

  it("kun aktive annoncer tjekkes, og lavest score sorteres først", () => {
    const punkter = bygAnnonceDoktor(
      [
        { ...sundJeans, id: "solgt", status: "sold" as const },
        { ...sundJeans, id: "kladde", status: "draft" as const },
        { ...sundJeans, id: "syg", prisTilDkk: 10_000, fotoRoller: ["full"] },
        sundJeans,
      ],
      NU,
    );
    expect(punkter).toHaveLength(2);
    expect(punkter[0]!.itemId).toBe("syg");
    expect(punkter[0]!.score).toBeLessThan(punkter[1]!.score);
  });

  it("ukendt marked vælter ikke tjekket — pris-tjekkene udelades bare", () => {
    const [punkt] = bygAnnonceDoktor(
      [{ ...sundJeans, maerke: "UkendtMærkeXYZ", titel: "UkendtMærkeXYZ jeans" }],
      NU,
    );
    expect(punkt).toBeDefined();
    expect(punkt!.score).toBe(100);
  });

  it("Plus-loftet er 3", () => {
    expect(DOKTOR_PLUS_ANTAL).toBe(3);
  });
});
