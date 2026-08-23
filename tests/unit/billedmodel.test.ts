// Modelkataloget og admin-valget (ejer-ordre 23/8). Kataloget er en kontrakt:
// id'erne står i databasen, og en model med forkert form ville sende ukendte
// felter ud i pipelinen. Derfor låses formen her.

import { describe, expect, it } from "vitest";
import {
  billedModelEllerStandard,
  billedModeller,
  hentBilledModel,
  standardBilledModel,
} from "@/lib/config";

describe("billedmodel-kataloget", () => {
  it("har unikke id'er (id'et gemmes i databasen)", () => {
    const ids = billedModeller.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("standardvalget peger på modeller der findes", () => {
    for (const formaal of ["preview", "final"] as const) {
      expect(hentBilledModel(standardBilledModel[formaal])).not.toBeNull();
    }
  });

  it("fal-modeller er edit-endpoints, Gemini-modeller er modelnavne", () => {
    for (const model of billedModeller) {
      if (model.provider === "fal") {
        // FalImageProvider kan kun oversætte edit-endpoints med
        // { prompt, image_urls, image_size }
        expect(model.model).toMatch(/^fal-ai\//);
      } else {
        expect(model.model).toMatch(/^gemini-/);
      }
    }
  });

  it("hver model oplyser pris og vandmærke — valget skal kunne træffes oplyst", () => {
    for (const model of billedModeller) {
      expect(model.costDkk).toBeGreaterThan(0);
      expect(model.vandmaerke.length).toBeGreaterThan(0);
      expect(model.note.length).toBeGreaterThan(0);
    }
  });

  it("Googles modeller siger tydeligt at SynthID ikke kan slås fra", () => {
    for (const model of billedModeller.filter((m) => m.provider === "gemini")) {
      expect(model.vandmaerke).toContain("SynthID");
    }
  });

  it("mindst én model uden SynthID — ellers er valget meningsløst", () => {
    expect(
      billedModeller.some((m) => m.provider === "fal" && !/^SynthID/.test(m.vandmaerke)),
    ).toBe(true);
  });
});

describe("billedModelEllerStandard", () => {
  it("giver den valgte model når id'et findes", () => {
    expect(billedModelEllerStandard("flux-2-pro", "final").id).toBe("flux-2-pro");
  });

  // Et slettet eller stavet-forkert id i databasen må ALDRIG vælte pipelinen
  it("falder tilbage til standarden ved ukendt eller tomt id", () => {
    expect(billedModelEllerStandard("findes-ikke", "final").id).toBe(
      standardBilledModel.final,
    );
    expect(billedModelEllerStandard(null, "preview").id).toBe(
      standardBilledModel.preview,
    );
  });
});
