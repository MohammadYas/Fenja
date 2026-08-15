import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";
import { hentGuides } from "@/lib/guides";

// Designmanifestets hårde copy-regler (HANDOFF §2.1) håndhævet som test:
// forbudte buzzwords, engelske UI-ord og emojis må aldrig snige sig ind i da.ts.

const FORBUDTE_ORD = [
  "supercharge",
  "unleash",
  "revolutionér",
  "revolutioner",
  "boost",
  "10x",
  "magisk",
  "på steroider",
  "ai-powered",
  "drevet af ai",
  "dashboard",
  "features",
  "pricing",
];

const EMOJI_MOENSTER = /\p{Extended_Pictographic}/u;

function alleTekster(vaerdi: unknown): string[] {
  if (typeof vaerdi === "string") return [vaerdi];
  if (vaerdi !== null && typeof vaerdi === "object") {
    return Object.values(vaerdi).flatMap(alleTekster);
  }
  return [];
}

describe("copy i da.ts overholder designmanifestet", () => {
  const tekster = alleTekster(da);

  it("indeholder tekst", () => {
    expect(tekster.length).toBeGreaterThan(0);
  });

  it.each(FORBUDTE_ORD)("bruger aldrig ordet %s", (ord) => {
    for (const tekst of tekster) {
      expect(tekst.toLowerCase()).not.toContain(ord);
    }
  });

  it("bruger ingen emojis", () => {
    for (const tekst of tekster) {
      expect(tekst).not.toMatch(EMOJI_MOENSTER);
    }
  });
});

describe("Lær-guides overholder manifestet og compliance (F-2)", () => {
  // Guides er strukturerede TS-data (lib/guides-indhold.ts) — al tekst
  // flades ud, så reglerne dækker titler, beskrivelser og alle blokke.
  const guides = hentGuides().map((guide) => ({
    navn: guide.slug,
    indhold: [
      guide.titel,
      guide.beskrivelse,
      ...guide.blokke.flatMap((blok) =>
        blok.type === "liste" ? blok.punkter : [blok.tekst],
      ),
    ].join("\n"),
  }));

  it("der findes mindst 5 guides", () => {
    expect(guides.length).toBeGreaterThanOrEqual(5);
  });

  it.each(guides.map((g) => [g.navn, g.indhold] as const))(
    "%s er fri for forbudte buzzwords og emojis",
    (_navn, indhold) => {
      for (const ord of FORBUDTE_ORD) {
        expect(indhold.toLowerCase()).not.toContain(ord);
      }
      expect(indhold).not.toMatch(EMOJI_MOENSTER);
    },
  );

  it("ingen guide opfordrer til dropshipping/bestillingsvarer (F-2-forbud)", () => {
    for (const guide of guides) {
      expect(guide.indhold.toLowerCase()).not.toContain("dropshipping-leverandør");
      expect(guide.indhold.toLowerCase()).not.toContain("bestillingsvarer");
    }
  });
});
