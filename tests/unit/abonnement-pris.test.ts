import { describe, expect, it } from "vitest";
import { abonnementer } from "@/lib/config";

// Ejer-rapport 2026-08-20: årsplanen viste den samme stykpris som månedsplanen
// (4,92 kr. for Plus), fordi udregningen altid brugte månedsprisen. Det skjulte
// hele årsrabatten — netop det, årsplanen sælger på. Reglerne låses her, så
// tallet aldrig kan skride igen.

/** Samme udregning som prisrækken i components/abonnement-valg.tsx */
function stykpris(
  tier: (typeof abonnementer.tiers)[number],
  periode: "md" | "aar",
): number {
  return periode === "aar"
    ? tier.prisDkkPrAar / (tier.annoncerPrMd * 12)
    : tier.prisDkkPrMd / tier.annoncerPrMd;
}

describe("abonnementets stykpris pr. periode", () => {
  it("årsprisen er ALTID lavere pr. kredit end månedsprisen", () => {
    for (const tier of abonnementer.tiers) {
      expect(
        stykpris(tier, "aar"),
        `${tier.id}: årsplanen skal være billigere pr. kredit`,
      ).toBeLessThan(stykpris(tier, "md"));
    }
  });

  it("årsprisen svarer til ti måneder — to måneder sparet", () => {
    for (const tier of abonnementer.tiers) {
      expect(tier.prisDkkPrAar, tier.id).toBe(tier.prisDkkPrMd * 10);
    }
  });

  it("Plus: 59 kr./md → 4,92 pr. kredit, 590 kr./år → 4,10 pr. kredit", () => {
    const plus = abonnementer.tiers.find((t) => t.id === "plus")!;
    expect(stykpris(plus, "md").toFixed(2)).toBe("4.92");
    expect(stykpris(plus, "aar").toFixed(2)).toBe("4.10");
  });

  it("Pro er billigere pr. kredit end Plus i begge perioder", () => {
    const plus = abonnementer.tiers.find((t) => t.id === "plus")!;
    const pro = abonnementer.tiers.find((t) => t.id === "pro")!;
    for (const periode of ["md", "aar"] as const) {
      expect(stykpris(pro, periode), periode).toBeLessThan(
        stykpris(plus, periode),
      );
    }
  });
});
