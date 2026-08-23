// FalImageProvider testes mod en stubbet @fal-ai/client — ingen rigtige kald,
// ingen nøgler i CI (NFR-5). Modellen injiceres altid udefra (kataloget i
// lib/config.ts), præcis som i gemini.test.ts.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const subscribe = vi.fn();
const upload = vi.fn();
const config = vi.fn();

vi.mock("@fal-ai/client", () => ({
  fal: {
    config: (...args: unknown[]) => config(...args),
    subscribe: (...args: unknown[]) => subscribe(...args),
    storage: { upload: (...args: unknown[]) => upload(...args) },
  },
}));

const { FalImageProvider } = await import("@/lib/providers/fal");

const OPSAETNING = {
  model: "fal-ai/test-model/edit",
  costDkk: 0.35,
  ekstraInput: { output_format: "jpeg" },
};
const REFERENCE_DATA_URL = "data:image/jpeg;base64,QUJD"; // "ABC"

function falSvar(url = "https://fal.media/ud.jpg") {
  return { data: { images: [{ url }] }, requestId: "req-1" };
}

describe("FalImageProvider", () => {
  beforeEach(() => {
    process.env.FAL_KEY = "test-noegle";
    subscribe.mockResolvedValue(falSvar());
    upload.mockResolvedValue("https://fal.media/uploads/ref.jpg");
  });

  afterEach(() => {
    delete process.env.FAL_KEY;
    vi.clearAllMocks();
  });

  it("kaster uden FAL_KEY (mock er default uden nøgler)", () => {
    delete process.env.FAL_KEY;
    expect(() => new FalImageProvider(OPSAETNING)).toThrow(/FAL_KEY/);
  });

  it("kalder det endpoint kataloget udpeger — aldrig et hårdkodet", async () => {
    const provider = new FalImageProvider(OPSAETNING);
    const resultat = await provider.genererOnModel({
      referenceUrl: REFERENCE_DATA_URL,
      prompt: "prompten",
      referenceVaegt: 0.65,
    });

    expect(subscribe).toHaveBeenCalledOnce();
    const [endpoint, args] = subscribe.mock.calls[0] as [
      string,
      { input: Record<string, unknown> },
    ];
    expect(endpoint).toBe("fal-ai/test-model/edit");
    expect(args.input.prompt).toBe("prompten");
    expect(args.input.image_urls).toEqual(["https://fal.media/uploads/ref.jpg"]);
    // 2:3 — samme format som Gemini-provideren leverer
    expect(args.input.image_size).toEqual({ width: 1024, height: 1536 });
    expect(args.input.output_format).toBe("jpeg");
    expect(resultat.url).toBe("https://fal.media/ud.jpg");
    expect(resultat.providerJobId).toBe("req-1");
    expect(resultat.costDkk).toBe(0.35);
  });

  it("uploader data-URL-referencen til fal (fal kan ikke læse vores storage)", async () => {
    const provider = new FalImageProvider(OPSAETNING);
    await provider.genererOnModel({
      referenceUrl: REFERENCE_DATA_URL,
      prompt: "p",
      referenceVaegt: 0.65,
    });
    expect(upload).toHaveBeenCalledOnce();
    const blob = upload.mock.calls[0]![0] as Blob;
    expect(blob.type).toBe("image/jpeg");
    expect(await blob.text()).toBe("ABC");
  });

  it("sender http-referencer videre uden upload", async () => {
    const provider = new FalImageProvider(OPSAETNING);
    await provider.genererOnModel({
      referenceUrl: "https://example.test/foto.jpg",
      prompt: "p",
      referenceVaegt: 0.65,
    });
    expect(upload).not.toHaveBeenCalled();
    const [, args] = subscribe.mock.calls[0] as [string, { input: { image_urls: string[] } }];
    expect(args.input.image_urls).toEqual(["https://example.test/foto.jpg"]);
  });

  // C-3: edit-endpointsene har ingen `strength`, så retryens strammere vægt
  // SKAL kunne ses i prompten — ellers betyder retryen ingenting.
  it("skærper prompten ved strammere referencevægt (C-3-retry)", async () => {
    const provider = new FalImageProvider(OPSAETNING);
    await provider.genererOnModel({
      referenceUrl: REFERENCE_DATA_URL,
      prompt: "prompten",
      referenceVaegt: 0.85,
    });
    const [, args] = subscribe.mock.calls[0] as [string, { input: { prompt: string } }];
    expect(args.input.prompt).toContain("EXACTLY");
  });

  // C-1: rensen må aldrig retouchere slid og pletter væk
  it("beder rensen om at bevare slid, pletter og fejl", async () => {
    const provider = new FalImageProvider(OPSAETNING);
    const resultat = await provider.rensBaggrund({ fotoUrl: REFERENCE_DATA_URL });
    const [, args] = subscribe.mock.calls[0] as [string, { input: { prompt: string } }];
    expect(args.input.prompt).toContain("wear, stains, pilling and flaws");
    expect(resultat.costDkk).toBe(0.35);
  });

  it("kaster tydeligt når svaret ikke indeholder et billede", async () => {
    subscribe.mockResolvedValue({ data: {}, requestId: "req-2" });
    const provider = new FalImageProvider(OPSAETNING);
    await expect(
      provider.rensBaggrund({ fotoUrl: "https://example.test/foto.jpg" }),
    ).rejects.toThrow(/intet billede/);
  });
});
