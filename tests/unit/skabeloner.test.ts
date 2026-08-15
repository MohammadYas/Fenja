import { describe, expect, it } from "vitest";
import { da } from "@/lib/copy/da";
import { PRESETS, hentPreset } from "@/lib/pipeline/presets";
import {
  GENERISK_SKABELON_ID,
  HJEM,
  KATEGORI_SKABELONER,
  byggPromptVersion,
  bygOnModelPromptMedSkabelon,
  hentHjem,
  hentHjemSted,
  hjemVersionsTag,
  skabelonVersionsTag,
  vaelgHjem,
  vaelgHjemMedValg,
  vaelgSkabelon,
  vaelgVisning,
} from "@/lib/pipeline/skabeloner";

const preset = hentPreset("lys-minimalisme");

describe("kategori-skabeloner (ejer-princip 2026-08-15)", () => {
  it.each([
    ["Kjole", "kjole"],
    ["sommernederdel", "kjole"],
    ["Mom jeans", "bukser"],
    ["cargo-bukser", "bukser"],
    ["Uldjakke", "jakke"],
    ["overshirt", "jakke"],
    ["Striktrøje", "overdel"],
    ["T-shirt med print", "overdel"],
    ["skjorte", "overdel"],
    ["Skuldertaske", "taske"],
  ])("%s matcher skabelonen %s", (kategori, forventet) => {
    expect(vaelgSkabelon(kategori).id).toBe(forventet);
  });

  it("ukendt, tom og manglende kategori falder tilbage til generisk", () => {
    expect(vaelgSkabelon("badeforhæng").id).toBe(GENERISK_SKABELON_ID);
    expect(vaelgSkabelon("").id).toBe(GENERISK_SKABELON_ID);
    expect(vaelgSkabelon(null).id).toBe(GENERISK_SKABELON_ID);
    expect(vaelgSkabelon(undefined).id).toBe(GENERISK_SKABELON_ID);
  });

  it("alle skabeloner har mindst én visning og et fokus", () => {
    for (const skabelon of KATEGORI_SKABELONER) {
      expect(skabelon.visninger.length).toBeGreaterThan(0);
      expect(skabelon.fokus.length).toBeGreaterThan(0);
    }
  });

  it("visningen er deterministisk pr. item (stabile retries)", () => {
    const skabelon = vaelgSkabelon("kjole");
    expect(vaelgVisning(skabelon, "item-42")).toBe(vaelgVisning(skabelon, "item-42"));
  });
});

describe("hjem-ankre: samme sælger, samme bolig", () => {
  it("samme bruger får altid samme hjem", () => {
    expect(vaelgHjem("bruger-a").id).toBe(vaelgHjem("bruger-a").id);
  });

  it("alle hjem dækker alle presets", () => {
    for (const hjem of HJEM) {
      for (const p of PRESETS) {
        expect(hjem.steder[p.id], `${hjem.id} mangler sted for ${p.id}`).toBeTruthy();
      }
    }
  });

  it("ukendt preset falder tilbage til presettets egen setting", () => {
    const fremmedPreset = { ...preset, id: "nyt-preset", navn: "Nyt", setting: "et sted" };
    expect(hentHjemSted(HJEM[0]!, fremmedPreset)).toBe("et sted");
  });

  it("prompten bruger samme hjem-sted for samme sælger på tværs af items", () => {
    const a = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "kjole",
    });
    const b = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-2",
      userId: "bruger-a",
      kategori: "jeans",
    });
    const sted = hentHjemSted(vaelgHjem("bruger-a"), preset);
    expect(a).toContain(sted);
    expect(b).toContain(sted);
  });

  it("presettet vælger sted I hjemmet — aldrig et nyt hjem", () => {
    const hjem = vaelgHjem("bruger-a");
    const stue = bygOnModelPromptMedSkabelon({
      preset: hentPreset("hyggelig-stue"),
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "kjole",
    });
    expect(stue).toContain(hjem.steder["hyggelig-stue"]!);
  });
});

describe("hjem-anker som brugervalg (S31)", () => {
  // Et hjem forskelligt fra brugerens deterministiske, så et selvvalg er synligt
  const anderledesHjem = HJEM.find((h) => h.id !== vaelgHjem("bruger-a").id)!;

  it("hentHjem slår op på id og er undefined ved ukendt/tomt", () => {
    expect(hentHjem(HJEM[0]!.id)?.id).toBe(HJEM[0]!.id);
    expect(hentHjem("badeforhæng-hjem")).toBeUndefined();
    expect(hentHjem("")).toBeUndefined();
    expect(hentHjem(null)).toBeUndefined();
    expect(hentHjem(undefined)).toBeUndefined();
  });

  it("et gyldigt selvvalgt hjem vinder over det deterministiske", () => {
    expect(vaelgHjemMedValg("bruger-a", anderledesHjem.id).id).toBe(anderledesHjem.id);
  });

  it("ukendt/tomt/manglende valg falder tilbage til det deterministiske", () => {
    const deterministisk = vaelgHjem("bruger-a").id;
    expect(vaelgHjemMedValg("bruger-a", "forældet-id").id).toBe(deterministisk);
    expect(vaelgHjemMedValg("bruger-a", "").id).toBe(deterministisk);
    expect(vaelgHjemMedValg("bruger-a", null).id).toBe(deterministisk);
    expect(vaelgHjemMedValg("bruger-a").id).toBe(deterministisk);
  });

  it("prompten bruger det selvvalgte hjem-sted", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "kjole",
      hjemAnker: anderledesHjem.id,
    });
    expect(prompt).toContain(anderledesHjem.steder[preset.id]!);
    expect(prompt).not.toContain(vaelgHjem("bruger-a").steder[preset.id]!);
  });

  it("da.ts har et brugervendt navn for hvert hjem, og kun for dem (NFR-12)", () => {
    for (const hjem of HJEM) {
      expect(da.konto.hjem.navne[hjem.id], `mangler navn for ${hjem.id}`).toBeTruthy();
    }
    expect(Object.keys(da.konto.hjem.navne).sort()).toEqual(
      HJEM.map((h) => h.id).sort(),
    );
  });
});

describe("sammensat prompt-version til pass-rate pr. version (FR-15/S31)", () => {
  it("indeholder preset-, skabelon- og hjem-tag hver med sit versionsnummer", () => {
    const version = byggPromptVersion({
      preset,
      kategori: "striktrøje",
      userId: "bruger-a",
    });
    expect(version).toContain(`${preset.id}@v${preset.version}`);
    expect(version).toContain(skabelonVersionsTag(vaelgSkabelon("striktrøje")));
    expect(version).toContain(hjemVersionsTag(vaelgHjem("bruger-a")));
  });

  it("afspejler det selvvalgte hjem", () => {
    const anderledesHjem = HJEM.find((h) => h.id !== vaelgHjem("bruger-a").id)!;
    const version = byggPromptVersion({
      preset,
      kategori: "kjole",
      userId: "bruger-a",
      hjemAnker: anderledesHjem.id,
    });
    expect(version).toContain(hjemVersionsTag(anderledesHjem));
  });

  it("udelader hjem-tagget uden userId (preset-setting bruges)", () => {
    const version = byggPromptVersion({ preset, kategori: "kjole" });
    expect(version).toContain(`${preset.id}@v${preset.version}`);
    expect(version).toContain(skabelonVersionsTag(vaelgSkabelon("kjole")));
    expect(version.split(" ")).toHaveLength(2);
  });

  it("er deterministisk: samme input giver samme version", () => {
    const args = { preset, kategori: "kjole", userId: "bruger-a" } as const;
    expect(byggPromptVersion(args)).toBe(byggPromptVersion(args));
  });
});

describe("promptbygning overholder C-2 og C-6", () => {
  const prompt = bygOnModelPromptMedSkabelon({
    preset,
    itemId: "item-1",
    userId: "bruger-a",
    kategori: "striktrøje",
  });

  it("reference-instruksen står først — prompten styrer aldrig tøjets udseende", () => {
    expect(
      prompt.startsWith("The person wears EXACTLY the garment from the reference image"),
    ).toBe(true);
  });

  it("anonymitet håndhæves altid (C-6)", () => {
    expect(prompt).toContain("an anonymous person");
    expect(prompt).toContain("the face is always hidden");
  });

  it("negativ-listen er altid med", () => {
    expect(prompt).toContain("Avoid:");
    expect(prompt).toContain("extra fingers");
  });

  it("prompten er på engelsk — ingen danske specialtegn (ejer-tuning 2026-08-16)", () => {
    expect(prompt).not.toMatch(/[æøåÆØÅ]/);
  });

  it("kategori-fokus er med", () => {
    expect(prompt).toContain(vaelgSkabelon("striktrøje").fokus);
  });

  it("uden userId bruges presettets setting; uden kategori den generiske skabelon", () => {
    const bar = bygOnModelPromptMedSkabelon({ preset, itemId: "item-1" });
    expect(bar).toContain(preset.setting);
    expect(bar).toContain(vaelgSkabelon(null).fokus);
  });

  it("er deterministisk: samme input giver samme prompt", () => {
    const igen = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "striktrøje",
    });
    expect(igen).toBe(prompt);
  });
});
