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
import { hentVisningsType } from "@/lib/pipeline/visninger";

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

  it("bukser: personen har ALTID overdel på og vises ALTID forfra (ejer-ordre 20/8)", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "jeans",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("from the FRONT");
    expect(prompt).toContain("neutral-colored top");
    expect(prompt).toContain("never shirtless");
  });

  it("ALLE kategorier forbyder bar overkrop (ejer-ordre 20/8: intet bar mave fis)", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "striktrøje",
    });
    expect(prompt).toContain("never shirtless");
    expect(prompt).toContain("never in underwear");
  });

  // Ejer-rapport 20/8: produkt-billedet "lignede at den floater". Framingen
  // krævede bøjle/gulv, mens den fælles negativ-liste forbød præcis det.
  it("produkt-visninger forbyder IKKE bøjle — og kræver at tøjet hviler på noget", () => {
    for (const id of ["stativ", "gulv", "detalje"] as const) {
      const prompt = bygOnModelPromptMedSkabelon({
        preset,
        itemId: "item-1",
        userId: "bruger-a",
        kategori: "Top & bluse",
        visning: hentVisningsType(id),
      });
      expect(prompt, id).not.toContain("visible hangers, clips or props");
      expect(prompt, id).not.toContain("an empty garment not worn by the person");
      expect(prompt, id).toContain("Never let the garment float or hover in mid-air");
      expect(prompt, id).toContain("never show a person or any body part");
    }
  });

  it("on-model beholder bøjle-forbuddet (tøjet skal bæres)", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Top & bluse",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("visible hangers, clips or props");
    expect(prompt).toContain("an empty garment not worn by the person");
  });

  // Ejer-rapport 20/8: en top blev vist som kort kjole på bare ben.
  it("en top forbliver en top, og bare ben er forbudt", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Top & bluse",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("a top stays a top and NEVER becomes a dress");
    expect(prompt).toContain("no bare legs");
  });

  // Ejer-ordre 20/8: personen og underdelen skal følge forside-seriens stil.
  it("personen er slank og naturlig med afslappet positur — aldrig posering", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Top & bluse",
      koen: "kvinde",
      haarFarve: "brunt",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("attractive adult Scandinavian woman in her early twenties");
    expect(prompt).toContain("brown hair worn naturally");
    expect(prompt).toContain("standing casually, not posing");
    expect(prompt).toContain("never an exaggerated hourglass figure");
    expect(prompt).toContain("never a fitness or model pose");
  });

  it("manden er ligeledes en attraktiv skandinavisk voksen", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Striktrøje",
      koen: "mand",
      haarFarve: "sort",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("attractive adult Scandinavian man in his early twenties");
    expect(prompt).toContain("black hair worn naturally");
  });

  // C-6 gælder uændret: aldrig en genkendelig eller virkelig person, og
  // personen er ALTID voksen.
  it("personen er altid voksen og aldrig genkendelig", () => {
    for (const koen of [null, "mand", "kvinde"]) {
      const prompt = bygOnModelPromptMedSkabelon({
        preset,
        itemId: "item-1",
        userId: "bruger-a",
        kategori: "Striktrøje",
        koen,
        visning: hentVisningsType("spejl"),
      });
      expect(prompt, String(koen)).toContain("adult");
      expect(prompt, String(koen)).toContain("never a recognizable or real person");
      expect(prompt, String(koen)).toContain("the face is always hidden");
    }
  });

  it("underdelen er skandinaviske, rolige jeans når referencetøjet er en overdel", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Striktrøje",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("Scandinavian everyday jeans");
    // Ejer-ordre 23/8: "drop de stramme bukser" — straight og afslappet,
    // og forbuddet gentages i den negative blok
    expect(prompt).toContain("STRAIGHT, relaxed leg");
    expect(prompt).toContain("NEVER slim-fit, NEVER skinny");
    expect(prompt).toContain("skinny jeans, tight or skin-tight trousers");
    expect(prompt).not.toContain("slim fit but never skinny");
    expect(prompt).toContain("so the reference garment stays the focus");
  });

  // Ejer-ordre 23/8: "kun iphones"
  it("telefonen i spejlet er ALTID en iPhone", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Striktrøje",
      visning: hentVisningsType("spejl"),
    });
    expect(prompt).toContain("ALWAYS an iPhone");
    expect(prompt).toContain("never an Android phone");
    expect(prompt).toContain("an Android or generic non-iPhone phone");
  });

  it("krops- og positurblokken hører KUN til on-model, ikke produktvisninger", () => {
    const produkt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "Striktrøje",
      visning: hentVisningsType("gulv"),
    });
    expect(produkt).not.toContain("standing casually, not posing");
    expect(produkt).not.toContain("Scandinavian everyday jeans");
  });

  // Ejer-ordre 20/8 (senere samme dag): en croptop SKAL vise mave — ellers
  // sælger annoncen et andet stykke tøj end det, sælgeren har.
  it("tøjet bestemmer huden: croptop må vise mave, og tøjet dækkes aldrig til", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset,
      itemId: "item-1",
      userId: "bruger-a",
      kategori: "top",
    });
    expect(prompt).toContain("crop top");
    expect(prompt).toContain("MUST be visible exactly as the garment leaves it");
    expect(prompt).toContain("never lengthen, extend or cover it up");
    // Den gamle blankoregel om tildækket overkrop må ikke være tilbage
    expect(prompt).not.toContain("torso is fully covered");
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

  it("hvert hjem har et brugervendt navn (NFR-12)", () => {
    // 22/8: de fem oprindelige hjem har oversatte navne i da.ts; de 100
    // genererede bærer deres eget navn fra hjem-generatoren. Kravet er, at
    // INGEN hjem ender med et rå id i UI'et.
    for (const hjem of HJEM) {
      const vist = da.konto.hjem.navne[hjem.id] ?? hjem.navn;
      expect(vist, `mangler navn for ${hjem.id}`).toBeTruthy();
      expect(vist).not.toBe(hjem.id);
    }
    // da.ts må kun navngive hjem der findes
    for (const id of Object.keys(da.konto.hjem.navne)) {
      expect(HJEM.some((h) => h.id === id), `ukendt hjem-navn: ${id}`).toBe(true);
    }
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
      prompt.startsWith("The person WEARS exactly the garment from the reference image"),
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
