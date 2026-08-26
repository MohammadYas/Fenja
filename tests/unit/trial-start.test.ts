import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startTrial } from "@/lib/trial/start";

// Prod-hændelsen 26/8: Trigger.dev-jobbet var ikke deployet, og fallbacken
// "kør i processen" døde stille på Netlify — hver besøgende så minutters falsk
// fremdrift og derefter en fejl. Kontrakten er nu: startTrial svarer ærligt
// false, når kørslen ikke reelt er i gang, og kalderen fejler ØJEBLIKKELIGT.

const { triggerMock, koerMock } = vi.hoisted(() => ({
  triggerMock: vi.fn(),
  koerMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@trigger.dev/sdk", () => ({ tasks: { trigger: triggerMock } }));
vi.mock("@/lib/trial/koersel", () => ({ koerOgGemTrial: koerMock }));
vi.mock("@/lib/supabase/service", () => ({ opretServiceKlient: () => ({}) }));

beforeEach(() => {
  triggerMock.mockReset().mockResolvedValue({ id: "run-1" });
  koerMock.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("MOCK_PROVIDERS", "");
});

afterEach(() => vi.unstubAllEnvs());

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
});
