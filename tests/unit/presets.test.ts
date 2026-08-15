import { afterEach, describe, expect, it } from "vitest";
import {
  MockPresetStatsStore,
  PRESETS,
  STANDARD_PRESET_ID,
  bygOnModelPrompt,
  hentPreset,
  kompilerPromptBlokke,
  passRate,
  presetVersionsTag,
  vaelgPersonAnker,
  type Preset,
} from "@/lib/pipeline/presets";

const ogRandom = Math.random;
const ogNow = Date.now;

afterEach(() => {
  Math.random = ogRandom;
  Date.now = ogNow;
});

describe("preset-kompilering er deterministisk", () => {
  it("samme (preset, itemId) giver altid samme prompt", () => {
    for (const preset of PRESETS) {
      expect(bygOnModelPrompt(preset, "item-42")).toBe(
        bygOnModelPrompt(preset, "item-42"),
      );
    }
  });

  it("kompileringen rører hverken Math.random eller Date.now", () => {
    Math.random = () => {
      throw new Error("Math.random i preset-kompilering");
    };
    Date.now = () => {
      throw new Error("Date.now i preset-kompilering");
    };
    for (const preset of PRESETS) {
      expect(() => bygOnModelPrompt(preset, "item-42")).not.toThrow();
    }
  });

  it("prompten er de fem blokke i SPEC §9-rækkefølge, adskilt af mellemrum", () => {
    const preset = hentPreset(STANDARD_PRESET_ID);
    const blokke = kompilerPromptBlokke(preset, "item-42");
    expect(blokke).toHaveLength(5);
    expect(blokke[0]).toBe(preset.blokke.referenceInstruks);
    expect(blokke[1]).toContain(vaelgPersonAnker("item-42"));
    expect(blokke[2]).toBe(`Setting: ${preset.blokke.setting}.`);
    expect(blokke[3]).toBe(`Fotostil: ${preset.blokke.fotostil}.`);
    expect(blokke[4]).toBe(`Undgå: ${preset.blokke.negativListe.join(", ")}.`);
    expect(bygOnModelPrompt(preset, "item-42")).toBe(blokke.join(" "));
  });

  it("versions-tagget matcher generations.prompt_version-formatet", () => {
    expect(presetVersionsTag(hentPreset("lys-minimalisme"))).toBe(
      "lys-minimalisme@v1",
    );
  });
});

describe("person-rotation dækker diversitetskravet (C-6)", () => {
  it("rotationen når ALLE ankre over mange items", () => {
    for (const preset of PRESETS) {
      const valgte = new Set<string>();
      for (let i = 0; i < 200; i++) {
        valgte.add(vaelgPersonAnker(`item-${i}`, preset.blokke.personAnkre));
      }
      expect(valgte).toEqual(new Set(preset.blokke.personAnkre));
    }
  });

  it("ankerlisten er reelt divers (mindst 3 forskellige ankre)", () => {
    for (const preset of PRESETS) {
      expect(new Set(preset.blokke.personAnkre).size).toBeGreaterThanOrEqual(3);
    }
  });

  it("et preset uden ankre afvises", () => {
    expect(() => vaelgPersonAnker("item-1", [])).toThrow();
  });
});

describe("negativ-listen kan aldrig udelades", () => {
  it("alle launch-presets har en ikke-tom negativ-liste i prompten", () => {
    for (const preset of PRESETS) {
      const prompt = bygOnModelPrompt(preset, "item-42");
      expect(prompt).toContain("Undgå:");
      for (const punkt of preset.blokke.negativListe) {
        expect(prompt).toContain(punkt);
      }
    }
  });

  it("kompilering af et preset med tom negativ-liste kaster", () => {
    const grundlag = hentPreset(STANDARD_PRESET_ID);
    const defekt: Preset = {
      ...grundlag,
      blokke: { ...grundlag.blokke, negativListe: [] },
    };
    expect(() => bygOnModelPrompt(defekt, "item-42")).toThrow(/negativ-liste/);
  });

  it("blanke punkter i negativ-listen afvises også", () => {
    const grundlag = hentPreset(STANDARD_PRESET_ID);
    const defekt: Preset = {
      ...grundlag,
      blokke: { ...grundlag.blokke, negativListe: ["  "] },
    };
    expect(() => bygOnModelPrompt(defekt, "item-42")).toThrow(/negativ-liste/);
  });
});

describe("preset-statistik (C-5/FR-15)", () => {
  it("mock-storen aggregerer runs, passes og gennemsnit pr. (id, version)", async () => {
    const store = new MockPresetStatsStore();
    await store.registrerKoersel({
      presetId: "lys-minimalisme",
      version: 1,
      bestaaet: true,
      fidelityScore: 0.9,
    });
    await store.registrerKoersel({
      presetId: "lys-minimalisme",
      version: 1,
      bestaaet: true,
      fidelityScore: 0.8,
    });
    await store.registrerKoersel({
      presetId: "lys-minimalisme",
      version: 1,
      bestaaet: false,
      fidelityScore: 0.4,
    });
    await store.registrerKoersel({
      presetId: "lys-minimalisme",
      version: 2,
      bestaaet: true,
      fidelityScore: 0.95,
    });

    const statistik = await store.hentStatistik();
    expect(statistik).toEqual([
      {
        presetId: "lys-minimalisme",
        version: 1,
        runs: 3,
        passes: 2,
        avgFidelity: 0.7,
      },
      {
        presetId: "lys-minimalisme",
        version: 2,
        runs: 1,
        passes: 1,
        avgFidelity: 0.95,
      },
    ]);
    expect(passRate(statistik[0]!)).toBeCloseTo(2 / 3);
  });
});
