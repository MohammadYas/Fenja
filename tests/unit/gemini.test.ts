// GeminiImageProvider testes mod en stubbet fetch — ingen rigtige kald,
// ingen nøgler i CI (NFR-5). Modellen injiceres altid udefra (config).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiImageProvider } from "@/lib/providers/gemini";

const OPSAETNING = { model: "test-model", costDkk: 0.5 };
const REFERENCE_DATA_URL = "data:image/jpeg;base64,QUJD"; // "ABC"

function geminiSvar(dele: unknown[]): Response {
  return new Response(
    JSON.stringify({
      responseId: "svar-1",
      candidates: [{ content: { parts: dele } }],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

describe("GeminiImageProvider", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-noegle";
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    vi.unstubAllGlobals();
  });

  it("kaster uden GEMINI_API_KEY (mock er default uden nøgler)", () => {
    delete process.env.GEMINI_API_KEY;
    expect(() => new GeminiImageProvider(OPSAETNING)).toThrow(/GEMINI_API_KEY/);
  });

  it("kalder generateContent med config-model, nøgle-header og inlineData-reference", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        geminiSvar([{ inlineData: { mimeType: "image/png", data: "REVG" } }]),
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new GeminiImageProvider(OPSAETNING);
    const resultat = await provider.genererOnModel({
      referenceUrl: REFERENCE_DATA_URL,
      prompt: "prompten",
      referenceVaegt: 0.65,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // Model-id'et kommer fra config — aldrig hårdkodet i provideren
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent",
    );
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe(
      "test-noegle",
    );
    const body = JSON.parse(init.body as string);
    expect(body.contents[0].parts).toEqual([
      { text: "prompten" },
      { inlineData: { mimeType: "image/jpeg", data: "QUJD" } },
    ]);
    expect(body.generationConfig).toEqual({
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "2:3" },
    });

    // Base64-svaret pakkes som data-URL, og config-costen følger med
    expect(resultat.url).toBe("data:image/png;base64,REVG");
    expect(resultat.providerJobId).toBe("svar-1");
    expect(resultat.costDkk).toBe(0.5);
  });

  it("skærper instruksen ved strammere referencevægt (C-3-retry)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        geminiSvar([{ inlineData: { mimeType: "image/png", data: "REVG" } }]),
      );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new GeminiImageProvider(OPSAETNING);
    await provider.genererOnModel({
      referenceUrl: REFERENCE_DATA_URL,
      prompt: "prompten",
      referenceVaegt: 0.85,
    });

    const body = JSON.parse(
      (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as string,
    );
    expect(body.contents[0].parts[0].text).toContain("EXACTLY");
  });

  it("kaster når svaret ikke indeholder et billede", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(geminiSvar([{ text: "kun tekst" }])),
    );
    const provider = new GeminiImageProvider(OPSAETNING);
    await expect(
      provider.genererOnModel({
        referenceUrl: REFERENCE_DATA_URL,
        prompt: "p",
        referenceVaegt: 0.65,
      }),
    ).rejects.toThrow(/intet billede/);
  });

  it("kaster med status ved HTTP-fejl", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("kvote opbrugt", { status: 429 })),
    );
    const provider = new GeminiImageProvider(OPSAETNING);
    await expect(
      provider.rensBaggrund({ fotoUrl: REFERENCE_DATA_URL }),
    ).rejects.toThrow(/HTTP 429/);
  });
});
