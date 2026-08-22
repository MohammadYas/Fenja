import { describe, expect, it } from "vitest";
import { genererHjem } from "@/lib/pipeline/hjem-generator";
import { HJEM } from "@/lib/pipeline/skabeloner";

// Hjem-prompterne skal holde forside-seriens niveau (ejer-krav 22/8:
// "så avancerede som dem på forsiden ... der må ik være flaws").
const hjem = genererHjem();

describe("de 100 genererede hjem", () => {
  it("er 100 og har entydige id'er og navne-kombinationer", () => {
    expect(hjem).toHaveLength(100);
    expect(new Set(hjem.map((h) => h.id)).size).toBe(100);
  });

  it("beskriver hvert sted udførligt nok til at styre modellen", () => {
    for (const h of hjem) {
      for (const tekst of [h.spejlrum, h.stue, h.gade]) {
        // Forside-prompterne er lange og konkrete; en tynd sætning giver
        // generiske AI-baggrunde
        expect(tekst.length, `for kort: ${h.id}`).toBeGreaterThan(180);
      }
    }
  });

  it("låser stedet fast, så alle sælgerens annoncer ligner samme sted", () => {
    for (const h of hjem) {
      expect(h.spejlrum).toMatch(/ALWAYS this exact room/);
      expect(h.stue).toMatch(/ALWAYS this exact room/);
      expect(h.gade).toMatch(/ALWAYS this exact spot/);
    }
  });

  it("navngiver lyset og forbyder blitz i hvert indendørs sted", () => {
    for (const h of hjem) {
      expect(h.spejlrum, `mangler lys: ${h.id}`).toMatch(/light|daylight/i);
      expect(h.spejlrum, `mangler no flash: ${h.id}`).toMatch(/no flash/);
      expect(h.stue).toMatch(/no flash/);
    }
  });

  it("holder billedet levet-i og aldrig som showroom", () => {
    for (const h of hjem) {
      expect(h.spejlrum).toMatch(/lived-in/i);
      expect(h.stue).toMatch(/lived-in/i);
    }
  });

  it("giver spejl, gulv og lys ægte variation på tværs af hjemmene", () => {
    // Blokkene roterer med forskellige skridt — ingen enkelt formulering må
    // dominere, ellers ligner hjemmene hinanden alligevel
    const foersteSaetning = hjem.map((h) => h.spejlrum.slice(0, 260));
    expect(new Set(foersteSaetning).size).toBeGreaterThan(50);
  });

  it("indgår i HJEM sammen med de fem oprindelige", () => {
    expect(HJEM.length).toBe(105);
    expect(HJEM.slice(5).map((h) => h.id)).toEqual(hjem.map((h) => h.id));
  });
});
