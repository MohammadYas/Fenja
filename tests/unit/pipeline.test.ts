import { describe, expect, it } from "vitest";
import { pipeline as cfg } from "@/lib/config";
import { rensFotos } from "@/lib/pipeline/cleanup";
import { tjekTroskab } from "@/lib/pipeline/fidelity";
import {
  fejlErNaevnt,
  genererValideretAnnonceTekst,
  validerAnnonceTekst,
} from "@/lib/pipeline/listing-text";
import { genererOnModelMedTroskab } from "@/lib/pipeline/onmodel";
import { PRESETS, bygOnModelPrompt, hentPreset, vaelgPersonAnker } from "@/lib/pipeline/presets";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";

const tekstInput = {
  maerke: "Ganni",
  stoerrelse: "M",
  stand: "God",
  kategori: "Striktrøje",
  fejlBeskrivelse: "lille hul ved venstre søm",
  labelTekst: null,
  koebsprisDkk: null,
};

describe("cleanup", () => {
  it("renser alle fotos parallelt", async () => {
    const provider = new MockImageProvider();
    const resultat = await rensFotos(provider, [
      { fotoId: "1", url: "a" },
      { fotoId: "2", url: "b" },
    ]);
    expect(resultat).toHaveLength(2);
    expect(resultat[0]?.rensetUrl).toBe("a#renset");
  });

  it("fejler hårdt hvis alle fotos fejler", async () => {
    const provider = new MockImageProvider({ rensFejler: true });
    await expect(rensFotos(provider, [{ fotoId: "1", url: "a" }])).rejects.toThrow();
  });
});

describe("presets & prompt (SPEC §9)", () => {
  it("har 3 nordiske presets ved launch (C-5)", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(3);
  });

  it("prompten indeholder alle fem blokke og styrer aldrig tøjets udseende", () => {
    const prompt = bygOnModelPrompt(hentPreset("lys-minimalisme"), "item-1");
    expect(prompt).toContain("PRÆCIS beklædningen fra referencebilledet");
    expect(prompt).toContain("ikke en genkendelig");
    expect(prompt).toContain("Setting:");
    expect(prompt).toContain("telefonkamera");
    expect(prompt).toContain("Undgå:");
  });

  it("personrotation er deterministisk pr. item (C-6)", () => {
    expect(vaelgPersonAnker("item-x")).toBe(vaelgPersonAnker("item-x"));
  });
});

describe("troskabs-tjek (C-3/K1)", () => {
  it("består over tærsklen og dumper under", async () => {
    const hoej = await tjekTroskab(new MockTextProvider({ troskabsScore: 0.9 }), {
      aegteUrl: "a",
      genereretUrl: "b",
    });
    expect(hoej.bestaaet).toBe(true);
    const lav = await tjekTroskab(new MockTextProvider({ troskabsScore: 0.5 }), {
      aegteUrl: "a",
      genereretUrl: "b",
    });
    expect(lav.bestaaet).toBe(false);
  });
});

describe("on-model med retry og fallback (C-3/B-6)", () => {
  it("leverer billede når troskaben består", async () => {
    const udfald = await genererOnModelMedTroskab({
      image: new MockImageProvider(),
      text: new MockTextProvider({ troskabsScore: 0.85 }),
      itemId: "i1",
      presetId: "lys-minimalisme",
      referenceUrl: "ref",
    });
    expect(udfald.billede).not.toBeNull();
    expect(udfald.billede?.fidelityScore).toBe(0.85);
    expect(udfald.forsoeg).toBe(1);
  });

  it("prøver igen med strammere reference og ender som null under tærskel", async () => {
    const image = new MockImageProvider();
    const udfald = await genererOnModelMedTroskab({
      image,
      text: new MockTextProvider({ troskabsScore: 0.3 }),
      itemId: "i1",
      presetId: "lys-minimalisme",
      referenceUrl: "ref",
    });
    expect(udfald.billede).toBeNull();
    expect(udfald.forsoeg).toBe(cfg.onModelForsoeg);
    expect(image.kald).toContain(`onmodel:vaegt=${cfg.strammereReferenceVaegt}`);
  });

  it("provider-fejl giver null-udfald uden kast (B-6)", async () => {
    const udfald = await genererOnModelMedTroskab({
      image: new MockImageProvider({ onModelFejler: true }),
      text: new MockTextProvider(),
      itemId: "i1",
      presetId: "lys-minimalisme",
      referenceUrl: "ref",
    });
    expect(udfald.billede).toBeNull();
  });
});

describe("annoncetekst-validering (D-1/D-2/D-4)", () => {
  it("fejl-i-tekst kan ikke omgås: manglende fejlomtale afvises", () => {
    const mangler = validerAnnonceTekst(
      {
        titel: "Ganni Striktrøje str. M",
        beskrivelse: "Fin trøje, god stand.",
        soegeord: [],
        prisforslagDkk: { fra: 80, til: 120 },
        prisBegrundelse: "typisk 80-120 kr.",
        costDkk: 0,
      },
      tekstInput,
    );
    expect(mangler).toContain("beskrivelsen nævner ikke de oplyste fejl");
  });

  it("fejlErNaevnt matcher på betydningsbærende ord", () => {
    expect(
      fejlErNaevnt("Der er et lille hul ved venstre søm, se foto.", "lille hul ved venstre søm"),
    ).toBe(true);
    expect(fejlErNaevnt("Perfekt stand.", "lille hul ved venstre søm")).toBe(false);
  });

  it("mock-provider genererer tekst der består valideringen (D-2)", async () => {
    const tekst = await genererValideretAnnonceTekst(new MockTextProvider(), tekstInput);
    expect(tekst.beskrivelse).toContain("lille hul");
    expect(tekst.titel).toContain("Ganni");
  });

  it("titel uden mærke/størrelse afvises (D-1)", () => {
    const mangler = validerAnnonceTekst(
      {
        titel: "Flot trøje",
        beskrivelse: "Har et lille hul ved venstre søm.",
        soegeord: [],
        prisforslagDkk: { fra: 80, til: 120 },
        prisBegrundelse: "x",
        costDkk: 0,
      },
      tekstInput,
    );
    expect(mangler).toContain("titel mangler mærke");
    expect(mangler).toContain("titel mangler størrelse");
  });

  // 20/8: Vinted-størrelsesformater ("M / 38 / 10", "EU 48 | W32") gengives
  // aldrig ordret af en LLM — én komponent som helt ord er nok
  it("størrelses-tjekket forstår Vinted-formater (D-1)", () => {
    const tekst = {
      titel: "Ganni Striktrøje str. 38",
      beskrivelse: "Har et lille hul ved venstre søm.",
      soegeord: [],
      prisforslagDkk: { fra: 80, til: 120 },
      prisBegrundelse: "x",
      costDkk: 0,
    };
    expect(
      validerAnnonceTekst(tekst, { ...tekstInput, stoerrelse: "M / 38 / 10" }),
    ).toEqual([]);
    expect(
      validerAnnonceTekst(
        { ...tekst, titel: "Carhartt bukser W32" },
        { ...tekstInput, maerke: "Carhartt", stoerrelse: "EU 48 | W32" },
      ),
    ).toEqual([]);
    // "Én størrelse" behøver ikke stå i titlen
    expect(
      validerAnnonceTekst(
        { ...tekst, titel: "Ganni taske" },
        { ...tekstInput, kategori: "Taske", stoerrelse: "Én størrelse" },
      ),
    ).toEqual([]);
    // "10" som del af "100 % uld" tæller IKKE (helords-match)
    expect(
      validerAnnonceTekst(
        { ...tekst, titel: "Ganni trøje 100 % uld" },
        { ...tekstInput, stoerrelse: "M / 38 / 10" },
      ),
    ).toContain("titel mangler størrelse");
  });

  it("titel-mangler repareres mekanisk i stedet for at vælte leverancen", async () => {
    // Mock der aldrig skriver størrelsen i titlen
    const provider = new MockTextProvider({ titelUdenStoerrelse: true });
    const tekst = await genererValideretAnnonceTekst(provider, {
      ...tekstInput,
      stoerrelse: "EU 48 | W32",
    });
    expect(tekst.titel).toContain("str. EU 48 | W32");
  });
});
