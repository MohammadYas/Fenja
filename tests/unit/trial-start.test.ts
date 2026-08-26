import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startTrial } from "@/lib/trial/start";

// Prod-hændelsen 26/8: Trigger.dev-jobbet var ikke deployet, og fallbacken
// "kør i processen" døde stille på Netlify — hver besøgende så minutters falsk
// fremdrift og derefter en fejl. Kontrakten er nu: startTrial svarer ærligt
// false, når kørslen ikke reelt er i gang, og kalderen fejler ØJEBLIKKELIGT.

const { triggerMock, koerMock, retrieveMock, cancelMock } = vi.hoisted(() => ({
  triggerMock: vi.fn(),
  koerMock: vi.fn(),
  retrieveMock: vi.fn(),
  cancelMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@trigger.dev/sdk", () => ({
  tasks: { trigger: triggerMock },
  runs: { retrieve: retrieveMock, cancel: cancelMock },
}));
vi.mock("@/lib/trial/koersel", () => ({ koerOgGemTrial: koerMock }));
vi.mock("@/lib/supabase/service", () => ({ opretServiceKlient: () => ({}) }));

beforeEach(() => {
  triggerMock.mockReset().mockResolvedValue({ id: "run-1" });
  koerMock.mockReset().mockResolvedValue(undefined);
  retrieveMock.mockReset().mockResolvedValue({ id: "run-1", status: "QUEUED" });
  cancelMock.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("MOCK_PROVIDERS", "");
  // Netlify-reserven er slået fra som udgangspunkt — testene for den stubber
  // URL + nøgle eksplicit
  vi.stubEnv("URL", "");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("startTrial svarer ærligt om kørslen reelt er i gang", () => {
  it("afleverer til Trigger.dev når nøglen findes — ingen lokal kørsel", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    expect(await startTrial("trial-1", "trial-1/original.jpg")).toBe(true);
    expect(triggerMock).toHaveBeenCalledWith("trial-pipeline", {
      trialId: "trial-1",
      originalSti: "trial-1/original.jpg",
    });
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("PRODUKTION: afvist Trigger.dev-job giver false — ALDRIG en frossen fallback", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    triggerMock.mockRejectedValue(new Error(`task "trial-pipeline" not found`));
    expect(await startTrial("trial-2", "trial-2/original.jpg")).toBe(false);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("PRODUKTION uden Trigger.dev-nøgle giver false — processen overlever ikke svaret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRIGGER_SECRET_KEY", "");
    expect(await startTrial("trial-3", "trial-3/original.jpg")).toBe(false);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("lokal udvikling uden nøgle kører i processen (den overlever)", async () => {
    // Vitest kører med NODE_ENV=test — netop en langtidslevende proces
    vi.stubEnv("TRIGGER_SECRET_KEY", "");
    expect(await startTrial("trial-4", "trial-4/original.jpg")).toBe(true);
    expect(koerMock).toHaveBeenCalledWith({}, "trial-4", "trial-4/original.jpg");
  });

  it("fejlet handoff i udvikling falder tilbage til processen — udviklingsflowet knækker ikke", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    triggerMock.mockRejectedValue(new Error("net nede"));
    expect(await startTrial("trial-5", "trial-5/original.jpg")).toBe(true);
    expect(koerMock).toHaveBeenCalled();
  });

  it("PRODUKTION: PENDING_VERSION (jobbet aldrig deployet) annulleres og giver false", async () => {
    // Prod-hændelse 26/8, del 2: Trigger.dev afviser IKKE et udeployet
    // task-id — kørslen venter for evigt på en version. Det må aldrig igen
    // ligne en kørsel, der er i gang.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    retrieveMock.mockResolvedValue({ id: "run-1", status: "PENDING_VERSION" });
    expect(await startTrial("trial-6", "trial-6/original.jpg")).toBe(false);
    expect(cancelMock).toHaveBeenCalledWith("run-1");
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("PENDING_VERSION i udvikling: fjernkørslen annulleres og processen tager over", async () => {
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    retrieveMock.mockResolvedValue({ id: "run-1", status: "PENDING_VERSION" });
    expect(await startTrial("trial-7", "trial-7/original.jpg")).toBe(true);
    expect(cancelMock).toHaveBeenCalledWith("run-1");
    expect(koerMock).toHaveBeenCalled();
  });

  it("kan status ikke aflæses, antages kørslen i gang (jobbet efterlader aldrig rækker uden slut-status)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    retrieveMock.mockRejectedValue(new Error("api nede"));
    expect(await startTrial("trial-8", "trial-8/original.jpg")).toBe(true);
    expect(cancelMock).not.toHaveBeenCalled();
    expect(koerMock).not.toHaveBeenCalled();
  });
});

describe("Netlify-baggrundsfunktionen er reserven, når Trigger.dev ikke kan (26/8)", () => {
  function medNetlifyMiljoe() {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TRIGGER_SECRET_KEY", "");
    vi.stubEnv("URL", "https://selja.dk");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-nøgle");
  }

  it("øjeblikkeligt 202 = ægte baggrundskørsel — trialen ER startet", async () => {
    medNetlifyMiljoe();
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await startTrial("trial-9", "trial-9/original.jpg")).toBe(true);
    const [url, opts] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://selja.dk/.netlify/functions/trial-koersel-background");
    expect((opts.headers as Record<string, string>)["x-selja-signatur"]).toMatch(/^[0-9a-f]{64}$/);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("alt andet end 202 (fx synkron kørsel på en konto uden baggrund) = IKKE startet", async () => {
    medNetlifyMiljoe();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    expect(await startTrial("trial-10", "trial-10/original.jpg")).toBe(false);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("netværksfejl mod funktionen = IKKE startet — ærlig fejl frem for zombie-række", async () => {
    medNetlifyMiljoe();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net nede")));
    expect(await startTrial("trial-11", "trial-11/original.jpg")).toBe(false);
  });

  it("PENDING_VERSION hos Trigger.dev falder videre til Netlify-reserven", async () => {
    medNetlifyMiljoe();
    vi.stubEnv("TRIGGER_SECRET_KEY", "nøgle");
    retrieveMock.mockResolvedValue({ id: "run-1", status: "PENDING_VERSION" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    expect(await startTrial("trial-12", "trial-12/original.jpg")).toBe(true);
    expect(cancelMock).toHaveBeenCalledWith("run-1");
  });
});
