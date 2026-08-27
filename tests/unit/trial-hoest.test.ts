import { beforeEach, describe, expect, it, vi } from "vitest";
import { hoestHaengendeTrials } from "@/lib/trial/db";
import { TRIAL_HAENGER_EFTER_MS } from "@/lib/trial/vaern";

// Dataanalyse 27/8: høsten lå kun i GET /api/prov/status og krævede altså en
// besøgende, der blev på siden og pollede. Under prod-hændelsen 26/8 lukkede
// de fanen, og 8 af 13 trials stod stadig i "running" dagen efter — talt med
// i admin som igangværende kørsler, der aldrig kom. Kontrakten er nu: sweepet
// afgør rækkerne uden en poller, rører KUN "running", og er best-effort.

vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin/trial-indstillinger", () => ({ hentTrialIndstillinger: vi.fn() }));

/** Minimal Supabase-fake: fanger filtrene, så vi kan bevise hvad sweepet rører */
function fakeKlient(svar: { data?: { id: string }[]; error?: { message: string } } | Error) {
  const kald: Record<string, unknown> = {};
  const kaede = {
    update(vaerdier: unknown) {
      kald.update = vaerdier;
      return kaede;
    },
    eq(kolonne: string, vaerdi: unknown) {
      kald.eq = [kolonne, vaerdi];
      return kaede;
    },
    lt(kolonne: string, vaerdi: unknown) {
      kald.lt = [kolonne, vaerdi];
      return kaede;
    },
    select() {
      if (svar instanceof Error) throw svar;
      return Promise.resolve(svar);
    },
  };
  return {
    kald,
    klient: {
      from(tabel: string) {
        kald.tabel = tabel;
        return kaede;
      },
    } as never,
  };
}

beforeEach(() => vi.useRealTimers());

describe("hoestHaengendeTrials afgør hængende rækker uden en poller", () => {
  it("markerer kun 'running' ældre end loftet som failed — med en læsbar årsag", async () => {
    const nu = new Date("2026-08-27T12:00:00.000Z").getTime();
    vi.useFakeTimers();
    vi.setSystemTime(nu);
    const { klient, kald } = fakeKlient({ data: [{ id: "a" }, { id: "b" }] });

    expect(await hoestHaengendeTrials(klient)).toBe(2);

    expect(kald.tabel).toBe("trial_usage");
    expect(kald.eq).toEqual(["status", "running"]);
    // Skæringen ligger præcis ét hænge-vindue tilbage — nyere kørsler røres ikke
    const [kolonne, skaering] = kald.lt as [string, string];
    expect(kolonne).toBe("created_at");
    expect(new Date(skaering).getTime()).toBe(nu - TRIAL_HAENGER_EFTER_MS);
    expect((kald.update as { status: string; fejl: string }).status).toBe("failed");
    expect((kald.update as { status: string; fejl: string }).fejl).toContain("svarede aldrig");
    vi.useRealTimers();
  });

  it("er best-effort: en databasefejl giver 0 og kaster ALDRIG videre", async () => {
    const { klient } = fakeKlient({ error: { message: "nede" } });
    expect(await hoestHaengendeTrials(klient)).toBe(0);
  });

  it("er best-effort: et kast fra klienten giver 0 — en ny prøve må ikke vælte", async () => {
    const { klient } = fakeKlient(new Error("netværk"));
    expect(await hoestHaengendeTrials(klient)).toBe(0);
  });
});
