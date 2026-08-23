// Tidsgrænsen på Supabase-kald (23/8: "the edge function timed out").
// Kernen i fixet er, at et HÆNGENDE kald bliver til en hurtig fejl — derfor
// testes præcis det: et fetch der aldrig svarer, skal afbrydes af signalet.

import { afterEach, describe, expect, it, vi } from "vitest";
import { erBeskyttetSti, sikkerVidereSti } from "@/lib/auth/ruter";
import {
  MIDDLEWARE_TIDSGRAENSE_MS,
  SUPABASE_TIDSGRAENSE_MS,
  fetchMedTidsgraense,
} from "@/lib/supabase/tidsgraense";

describe("fetchMedTidsgraense", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("afbryder et kald der hænger — det er hele fixet", async () => {
    // Et fetch der ALDRIG svarer af sig selv, kun via abort-signalet
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: unknown, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(init.signal?.reason ?? new Error("afbrudt")),
            );
          }),
      ),
    );

    const start = Date.now();
    await expect(fetchMedTidsgraense(80)("https://x.test/")).rejects.toThrow();
    // Fejlen skal komme fra tidsgrænsen (hurtigt), ikke fra evig venten
    expect(Date.now() - start).toBeLessThan(3_000);
  });

  it("lader et normalt svar passere urørt", async () => {
    const svar = new Response("ok");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(svar));
    await expect(fetchMedTidsgraense(1_000)("https://x.test/")).resolves.toBe(svar);
  });

  it("respekterer et eksisterende abort-signal fra klienten", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: unknown, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(init.signal?.reason ?? new Error("afbrudt")),
            );
          }),
      ),
    );
    const egen = new AbortController();
    const kald = fetchMedTidsgraense(60_000)("https://x.test/", {
      signal: egen.signal,
    });
    egen.abort(new Error("klienten annullerede"));
    await expect(kald).rejects.toThrow();
  });

  it("middleware-grænsen er strammere end server-grænsen", () => {
    // Middleware står foran HVERT request — den skal give op først, så
    // edge-funktionen aldrig selv når Netlifys timeout
    expect(MIDDLEWARE_TIDSGRAENSE_MS).toBeLessThan(SUPABASE_TIDSGRAENSE_MS);
  });
});

describe("erBeskyttetSti", () => {
  it("beskytter app-ruterne, ikke marketing-siderne", () => {
    for (const sti of ["/oversigt", "/items/abc", "/nyt-item", "/admin", "/konto"]) {
      expect(erBeskyttetSti(sti)).toBe(true);
    }
    for (const sti of ["/", "/priser", "/log-ind", "/privatliv", "/laer/guide"]) {
      expect(erBeskyttetSti(sti)).toBe(false);
    }
  });
});

describe("sikkerVidereSti (åben-omdirigerings-værn)", () => {
  it("tillader interne stier", () => {
    expect(sikkerVidereSti("/kreditter")).toBe("/kreditter");
  });

  it("afviser eksterne og protokol-relative mål", () => {
    expect(sikkerVidereSti("//evil.dk/phish")).toBe("/oversigt");
    expect(sikkerVidereSti("https://evil.dk")).toBe("/oversigt");
    expect(sikkerVidereSti(null)).toBe("/oversigt");
    expect(sikkerVidereSti("")).toBe("/oversigt");
  });
});
