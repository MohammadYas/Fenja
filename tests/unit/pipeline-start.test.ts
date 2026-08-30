import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startPipeline, startRegen } from "@/lib/pipeline/start";

// Prod-hændelsen 30/8: item-pipelinen kørte på Trigger.dev-bundtet
// 20260822.1 — otte dage gammel kode — fordi Netlify-deploys ikke rører
// Trigger.dev, og Trigger.dev-deployet aldrig er kørt. Hver rettelse siden
// 22/8 var død i produktion, og leveringsmodellens 503 væltede ALLE billeder.
// Kontrakten er nu den samme som for trialen: Netlify-baggrundsfunktionen er
// førstevalget i produktion, Trigger.dev er reserven, og kan ingen af dem
// starte kørslen, markeres annoncen failed med det samme.

const { triggerMock, retrieveMock, cancelMock, koerMock, regenMock, opdateringer } =
  vi.hoisted(() => ({
    triggerMock: vi.fn(),
    retrieveMock: vi.fn(),
    cancelMock: vi.fn(),
    koerMock: vi.fn(),
    regenMock: vi.fn(),
    opdateringer: [] as { tabel: string; felter: Record<string, unknown>; id: string }[],
  }));

vi.mock("server-only", () => ({}));
vi.mock("@trigger.dev/sdk", () => ({
  tasks: { trigger: triggerMock },
  runs: { retrieve: retrieveMock, cancel: cancelMock },
}));
vi.mock("@/lib/pipeline/koersel", () => ({
  koerItemSikkert: koerMock,
  koerRegenSikkert: regenMock,
}));
vi.mock("@/lib/supabase/service", () => ({
  opretServiceKlient: () => ({
    from: (tabel: string) => ({
      update: (felter: Record<string, unknown>) => ({
        eq: async (_kolonne: string, id: string) => {
          opdateringer.push({ tabel, felter, id });
          return { error: null };
        },
      }),
    }),
  }),
}));

beforeEach(() => {
  triggerMock.mockReset().mockResolvedValue({ id: "run-1" });
  retrieveMock.mockReset().mockResolvedValue({ id: "run-1", status: "QUEUED" });
  cancelMock.mockReset().mockResolvedValue(undefined);
  koerMock.mockReset().mockResolvedValue(undefined);
  regenMock.mockReset().mockResolvedValue(undefined);
  opdateringer.length = 0;
  vi.stubEnv("MOCK_PROVIDERS", "");
  vi.stubEnv("URL", "");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.stubEnv("TRIGGER_SECRET_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** Produktion med et virkende Netlify-baggrundskald (202 med det samme) */
function prodMedNetlify(status = 202) {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("URL", "https://selja.dk");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-nøgle");
  const hentet = vi.fn().mockResolvedValue({ status });
  vi.stubGlobal("fetch", hentet);
  return hentet;
}

describe("startPipeline vælger den motor der faktisk kører koden", () => {
  it("PRODUKTION: Netlify-baggrunden er førstevalget — Trigger.dev røres ikke", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    const hentet = prodMedNetlify();

    expect(await startPipeline("item-1", "preset-1", ["spejl"])).toBe("netlify");

    expect(triggerMock).not.toHaveBeenCalled();
    expect(koerMock).not.toHaveBeenCalled();
    const [url, init] = hentet.mock.calls[0]!;
    expect(url).toBe("https://selja.dk/.netlify/functions/item-koersel-background");
    expect(JSON.parse((init as { body: string }).body)).toEqual({
      slags: "pipeline",
      itemId: "item-1",
      presetId: "preset-1",
      visninger: ["spejl"],
    });
    expect((init as { headers: Record<string, string> }).headers["x-selja-signatur"]).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it("PRODUKTION: svarer Netlify ikke 202, tages Trigger.dev som reserve", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    prodMedNetlify(404);

    expect(await startPipeline("item-2", "preset-1", ["spejl"])).toBe("trigger");
    expect(triggerMock).toHaveBeenCalledWith("item-pipeline", {
      itemId: "item-2",
      presetId: "preset-1",
      visninger: ["spejl"],
    });
  });

  it("PRODUKTION: en kørsel der venter på et deploy annulleres og tæller ikke", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    prodMedNetlify(500);
    retrieveMock.mockResolvedValue({ id: "run-1", status: "PENDING_VERSION" });

    expect(await startPipeline("item-3", "preset-1", ["spejl"])).toBe(false);
    expect(cancelMock).toHaveBeenCalledWith("run-1");
    expect(opdateringer).toEqual([
      { tabel: "items", felter: { status: "failed" }, id: "item-3" },
    ]);
  });

  it("PRODUKTION uden nogen motor: annoncen markeres failed med det samme", async () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(await startPipeline("item-4", "preset-1", ["spejl"])).toBe(false);
    expect(koerMock).not.toHaveBeenCalled();
    expect(opdateringer).toEqual([
      { tabel: "items", felter: { status: "failed" }, id: "item-4" },
    ]);
  });

  it("lokal udvikling kører i processen — den overlever svaret", async () => {
    expect(await startPipeline("item-5", "preset-1", ["spejl"])).toBe("proces");
    expect(koerMock).toHaveBeenCalledWith("item-5", "preset-1", ["spejl"]);
  });
});

describe("startRegen følger samme rækkefølge", () => {
  it("PRODUKTION: Netlify-baggrunden tager regenereringen", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    const hentet = prodMedNetlify();

    expect(await startRegen("item-6", "visualisering", "req-1", "preset-1")).toBe("netlify");

    expect(triggerMock).not.toHaveBeenCalled();
    const [, init] = hentet.mock.calls[0]!;
    expect(JSON.parse((init as { body: string }).body)).toEqual({
      slags: "regen",
      itemId: "item-6",
      del: "visualisering",
      requestId: "req-1",
      presetId: "preset-1",
    });
  });

  it("PRODUKTION uden motor: false — men annoncen røres ikke (den er leveret)", async () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(await startRegen("item-7", "visualisering", "req-2")).toBe(false);
    expect(regenMock).not.toHaveBeenCalled();
    expect(opdateringer).toEqual([]);
  });
});
