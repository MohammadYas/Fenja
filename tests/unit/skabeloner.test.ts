import { describe, expect, it } from "vitest";
import { PRESETS, hentPreset } from "@/lib/pipeline/presets";
import {
  GENERISK_SKABELON_ID,
  HJEM,
  KATEGORI_SKABELONER,
  bygOnModelPromptMedSkabelon,
  hentHjemSted,
  vaelgHjem,
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
    const fremmedPreset = { id: "nyt-preset", navn: "Nyt", version: 1, setting: "et sted" };
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

describe("promptbygning overholder C-2 og C-6", () => {
  const prompt = bygOnModelPromptMedSkabelon({
    preset,
    itemId: "item-1",
    userId: "bruger-a",
    kategori: "striktrøje",
  });

  it("reference-instruksen står først — prompten styrer aldrig tøjets udseende", () => {
    expect(prompt.startsWith("Personen bærer PRÆCIS beklædningen fra referencebilledet")).toBe(
      true,
    );
  });

  it("anonymitet håndhæves altid (C-6)", () => {
    expect(prompt).toContain("anonym person");
    expect(prompt).toContain("ansigtet er altid skjult");
  });

  it("negativ-listen er altid med", () => {
    expect(prompt).toContain("Undgå:");
    expect(prompt).toContain("ekstra fingre");
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
