import { describe, expect, it } from "vitest";
import { emails } from "@/lib/copy/emails";

// Designmanifestets hårde copy-regler (HANDOFF §2.1) håndhævet på mail-copy —
// samme mønster som tests/unit/copy.test.ts (som ikke må ændres, derfor er
// listen spejlet her). Derudover: gratis-tier er afskaffet (STATUS 2026-08-15),
// så ingen mail må love gratis annoncer.

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

// Parametriserede tekster er funktioner og fanges ikke af alleTekster —
// de kaldes eksplicit med eksempeldata, så reglerne også dækker dem.
const funktionsTekster = [
  emails.annonceKlar.emne("Uldstrik"),
  emails.annonceKlar.brod("Uldstrik"),
  emails.kvittering.koebslinje(10, 29),
  emails.kreditRefunderet.brod("Uldstrik"),
];

describe("copy i emails.ts overholder designmanifestet", () => {
  const tekster = [...alleTekster(emails), ...funktionsTekster];

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

  it("lover aldrig gratis annoncer (gratis-tier er afskaffet)", () => {
    for (const tekst of tekster) {
      expect(tekst.toLowerCase()).not.toMatch(/gratis annonce/);
      expect(tekst.toLowerCase()).not.toMatch(/\d+\s*gratis/);
    }
  });
});
