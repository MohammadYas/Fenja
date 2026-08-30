import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type TestModel = {
  id: string;
  navn: string;
  provider: string;
  model: string;
  costDkk: number;
  vandmaerke: string;
  note: string;
};

const geminiPro: TestModel = {
  id: "gemini-pro",
  navn: "Nano Banana Pro",
  provider: "gemini",
  model: "gemini-3-pro-image",
  costDkk: 0.95,
  vandmaerke: "SynthID",
  note: "Primær",
};

const providerSvar = vi.hoisted(() => ({
  fejlPrModel: new Map<string, Error>(),
  finalModel: {
    id: "gemini-pro",
    navn: "Nano Banana Pro",
    provider: "gemini",
    model: "gemini-3-pro-image",
    costDkk: 0.95,
    vandmaerke: "SynthID",
    note: "Primær",
  } as TestModel,
}));

vi.mock("@/lib/admin/billedmodel-valg", () => ({
  hentValgtModel: async (formaal: "preview" | "final") =>
    formaal === "preview"
      ? {
          id: "gemini-flash",
          navn: "Nano Banana 2",
          provider: "gemini",
          model: "gemini-3.1-flash-image",
          costDkk: 0.28,
          vandmaerke: "SynthID",
          note: "Backup",
        }
      : providerSvar.finalModel,
}));

function testProvider() {
  return class {
    constructor(private model: { model: string; costDkk: number }) {}

    async rensBaggrund(input: { fotoUrl: string }) {
      return { url: input.fotoUrl, costDkk: this.model.costDkk };
    }

    async genererOnModel() {
      const fejl = providerSvar.fejlPrModel.get(this.model.model);
      if (fejl) throw fejl;
      return {
        url: `data:image/png;base64,${this.model.model}`,
        providerJobId: `${this.model.model}-job`,
        costDkk: this.model.costDkk,
      };
    }
  };
}

vi.mock("@/lib/providers/gemini", () => ({ GeminiImageProvider: testProvider() }));
vi.mock("@/lib/providers/fal", () => ({ FalImageProvider: testProvider() }));

import { hentImageProvider } from "@/lib/providers";

const onModelInput = {
  referenceUrl: "data:image/png;base64,reference",
  prompt: "Bevar varen præcist",
  referenceVaegt: 0.85,
};

describe("Gemini-backup ved midlertidige providerfejl", () => {
  const oprindeligGemini = process.env.GEMINI_API_KEY;
  const oprindeligFal = process.env.FAL_KEY;
  const oprindeligDeepSeek = process.env.DEEPSEEK_API_KEY;
  const oprindeligMock = process.env.MOCK_PROVIDERS;
  let consoleWarn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-gemini";
    process.env.DEEPSEEK_API_KEY = "test-deepseek";
    delete process.env.MOCK_PROVIDERS;
    providerSvar.fejlPrModel.clear();
    providerSvar.finalModel = geminiPro;
    consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarn.mockRestore();
    if (oprindeligGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oprindeligGemini;
    if (oprindeligFal === undefined) delete process.env.FAL_KEY;
    else process.env.FAL_KEY = oprindeligFal;
    if (oprindeligDeepSeek === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = oprindeligDeepSeek;
    if (oprindeligMock === undefined) delete process.env.MOCK_PROVIDERS;
    else process.env.MOCK_PROVIDERS = oprindeligMock;
  });

  it("leverer med Gemini Flash når Gemini Pro svarer 503 high demand", async () => {
    providerSvar.fejlPrModel.set(
      "gemini-3-pro-image",
      new Error("gemini: HTTP 503 — high demand"),
    );

    const provider = await hentImageProvider();
    const resultat = await provider.genererOnModel(onModelInput);

    expect(resultat).toEqual({
      url: "data:image/png;base64,gemini-3.1-flash-image",
      providerJobId: "gemini-3.1-flash-image-job",
      costDkk: 0.28,
    });
  });

  it("skjuler ikke permanente 400-fejl bag backupmodellen", async () => {
    providerSvar.fejlPrModel.set(
      "gemini-3-pro-image",
      new Error("gemini: HTTP 400 — ugyldig forespørgsel"),
    );

    const provider = await hentImageProvider();

    await expect(provider.genererOnModel(onModelInput)).rejects.toThrow("HTTP 400");
  });

  it("bevarer begge årsager når både Pro og Gemini-backup fejler", async () => {
    providerSvar.fejlPrModel.set(
      "gemini-3-pro-image",
      new Error("gemini: HTTP 503 — Pro overbelastet"),
    );
    providerSvar.fejlPrModel.set(
      "gemini-3.1-flash-image",
      new Error("gemini: HTTP 503 — Flash overbelastet"),
    );

    const provider = await hentImageProvider();

    await expect(provider.genererOnModel(onModelInput)).rejects.toThrow(
      /Primær: gemini: HTTP 503 — Pro overbelastet.*Backup: gemini: HTTP 503 — Flash overbelastet/,
    );
  });

  // Vandmærket må ikke skifte bag om ejeren: fal-modellerne leverer UDEN
  // SynthID, så en 503 dér skal fejle ærligt frem for at lande på Gemini.
  it("skifter ikke til Gemini når leveringsmodellen er en fal-model", async () => {
    process.env.FAL_KEY = "test-fal";
    providerSvar.finalModel = {
      id: "flux-2-pro",
      navn: "FLUX.2 [pro]",
      provider: "fal",
      model: "fal-ai/flux-2-pro/edit",
      costDkk: 0.35,
      vandmaerke: "Ingen SynthID",
      note: "fal",
    };
    providerSvar.fejlPrModel.set(
      "fal-ai/flux-2-pro/edit",
      new Error("fal: HTTP 503 — overbelastet"),
    );

    const provider = await hentImageProvider();

    await expect(provider.genererOnModel(onModelInput)).rejects.toThrow(
      /^fal: HTTP 503 — overbelastet$/,
    );
  });
});
