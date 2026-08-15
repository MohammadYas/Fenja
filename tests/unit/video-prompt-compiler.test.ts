import { describe, expect, it } from "vitest";
import {
  FAST_NEGATIV_LISTE,
  kompilerPrompt,
  maxOrdForVarighed,
  PROMPT_VERSION,
  taelOrd,
  type PromptInput,
} from "@/lib/video/prompt-compiler";

function basisInput(overrides: Partial<PromptInput> = {}): PromptInput {
  return {
    stilAnker: "håndholdt selfie-video, én tager",
    karakter: "en kvinde midt i tyverne med praktisk tøj",
    lokation: "et lyst køkken med morgenlys",
    actionBeats: [
      "hun løfter produktet op mod kameraet",
      "hun peger på etiketten",
    ],
    dialog: "Den her sparede mig en halv time i går",
    audio: "reallyd fra køkkenet",
    varighedSek: 8,
    format: "9:16",
    referencer: [],
    ...overrides,
  };
}

describe("maxOrdForVarighed", () => {
  it("giver 2 ord pr. sekund i hele Seedance-spændet", () => {
    expect(maxOrdForVarighed(4)).toBe(8);
    expect(maxOrdForVarighed(8)).toBe(16);
    expect(maxOrdForVarighed(15)).toBe(30);
  });
});

describe("taelOrd", () => {
  it("tæller ord robust på tværs af whitespace", () => {
    expect(taelOrd("  to   ord  ")).toBe(2);
    expect(taelOrd("")).toBe(0);
    expect(taelOrd("ét")).toBe(1);
  });
});

describe("kompilerPrompt · ordgrænse (blok 5)", () => {
  it("accepterer dialog præcis på ordloftet", () => {
    const dialog = Array.from({ length: 8 }, (_, i) => `ord${i}`).join(" ");
    const resultat = kompilerPrompt(basisInput({ varighedSek: 4, dialog }));
    expect(resultat.ordIDialog).toBe(8);
    expect(resultat.maxOrd).toBe(8);
  });

  it("afviser dialog ét ord over loftet med begge tal i fejlen", () => {
    const dialog = Array.from({ length: 9 }, (_, i) => `ord${i}`).join(" ");
    expect(() => kompilerPrompt(basisInput({ varighedSek: 4, dialog }))).toThrow(
      /9 ord.*højst 8 ord/,
    );
  });

  it("skalerer loftet med varigheden", () => {
    const dialog = Array.from({ length: 20 }, (_, i) => `ord${i}`).join(" ");
    expect(() => kompilerPrompt(basisInput({ varighedSek: 8, dialog }))).toThrow();
    expect(kompilerPrompt(basisInput({ varighedSek: 10, dialog })).maxOrd).toBe(20);
  });

  it("afviser tom dialog", () => {
    expect(() => kompilerPrompt(basisInput({ dialog: "   " }))).toThrow(/tom/);
  });
});

describe("kompilerPrompt · blok-rækkefølge", () => {
  it("giver altid præcis 8 blokke i den faste rækkefølge", () => {
    const resultat = kompilerPrompt(basisInput());
    expect(resultat.blokke).toHaveLength(8);
    const forventedePrefixer = [
      "Stil:",
      "Karakter:",
      "Lokation:",
      "Handling:",
      "Dialog",
      "Audio:",
      "Undgå:",
      "Teknik:",
    ];
    forventedePrefixer.forEach((prefix, index) => {
      expect(resultat.blokke[index]).toMatch(new RegExp(`^${prefix}`));
    });
  });

  it("samler prompten som blokkene i rækkefølge", () => {
    const resultat = kompilerPrompt(basisInput());
    expect(resultat.prompt).toBe(resultat.blokke.join("\n\n"));
    let senestePosition = -1;
    for (const blok of resultat.blokke) {
      const position = resultat.prompt.indexOf(blok);
      expect(position).toBeGreaterThan(senestePosition);
      senestePosition = position;
    }
  });

  it("nummererer action beats i inputrækkefølge", () => {
    const resultat = kompilerPrompt(
      basisInput({ actionBeats: ["første", "andet", "tredje"] }),
    );
    expect(resultat.blokke[3]).toContain("1) første 2) andet 3) tredje");
  });

  it("afviser tom beat-liste", () => {
    expect(() => kompilerPrompt(basisInput({ actionBeats: [] }))).toThrow(
      /action beat/,
    );
  });
});

describe("kompilerPrompt · negativ-liste (blok 7)", () => {
  it("har altid hele den faste negativ-liste med", () => {
    const resultat = kompilerPrompt(basisInput());
    for (const negativ of FAST_NEGATIV_LISTE) {
      expect(resultat.blokke[6]).toContain(negativ);
    }
  });

  it("ekstra negativer udvider listen uden at erstatte den faste", () => {
    const resultat = kompilerPrompt(
      basisInput({ ekstraNegativer: ["neonlys", "slowmotion"] }),
    );
    expect(resultat.blokke[6]).toContain("neonlys");
    expect(resultat.blokke[6]).toContain("slowmotion");
    for (const negativ of FAST_NEGATIV_LISTE) {
      expect(resultat.blokke[6]).toContain(negativ);
    }
  });
});

describe("kompilerPrompt · referencer (@image1…)", () => {
  it("nummererer referencer efter inputrækkefølge og binder dem til de rigtige blokke", () => {
    const resultat = kompilerPrompt(
      basisInput({
        referencer: [
          { rolle: "produkt", url: "https://x/produkt.jpg" },
          { rolle: "karakter", url: "https://x/person.jpg" },
          { rolle: "lokation", url: "https://x/rum.jpg" },
        ],
      }),
    );
    expect(resultat.blokke[3]).toContain("@image1"); // produkt → handling
    expect(resultat.blokke[1]).toContain("@image2"); // karakter → karakter-anker
    expect(resultat.blokke[2]).toContain("@image3"); // lokation → lokation
  });

  it("skriver reference-manifestet i teknik-blokken", () => {
    const resultat = kompilerPrompt(
      basisInput({
        referencer: [
          { rolle: "karakter", url: "https://x/person.jpg" },
          { rolle: "produkt", url: "https://x/produkt.jpg" },
        ],
      }),
    );
    expect(resultat.blokke[7]).toContain(
      "Referencer: @image1 = karakter, @image2 = produkt",
    );
  });

  it("udelader @image-tags helt uden referencer (t2v)", () => {
    const resultat = kompilerPrompt(basisInput({ referencer: [] }));
    expect(resultat.prompt).not.toContain("@image");
  });
});

describe("kompilerPrompt · determinisme & version", () => {
  it("giver identisk output ved samme input", () => {
    const input = basisInput({
      referencer: [{ rolle: "produkt", url: "https://x/produkt.jpg" }],
      ekstraNegativer: ["neonlys"],
    });
    const a = kompilerPrompt(input);
    const b = kompilerPrompt(input);
    expect(a).toEqual(b);
    expect(a.prompt).toBe(b.prompt);
  });

  it("stempler promptVersion i output", () => {
    expect(kompilerPrompt(basisInput()).promptVersion).toBe(PROMPT_VERSION);
  });
});

describe("kompilerPrompt · varighed", () => {
  it("afviser varighed uden for Seedance-spændet 4–15 s", () => {
    expect(() => kompilerPrompt(basisInput({ varighedSek: 3 }))).toThrow(
      /varighed/i,
    );
    expect(() => kompilerPrompt(basisInput({ varighedSek: 16 }))).toThrow(
      /varighed/i,
    );
    expect(() => kompilerPrompt(basisInput({ varighedSek: 7.5 }))).toThrow(
      /varighed/i,
    );
  });

  it("skriver format og varighed i teknik-blokken", () => {
    const resultat = kompilerPrompt(basisInput({ varighedSek: 12, format: "9:16" }));
    expect(resultat.blokke[7]).toContain("9:16");
    expect(resultat.blokke[7]).toContain("12 sekunder");
  });
});
