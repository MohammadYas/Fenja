// Låser fixet på ejer-rapporten "kan ikke logge ind": ringen mellem
// middlewarens auto-login og sidernes login-væg.
//
// Ringen opstod, når browseren havde en auth-cookie, der SÅ frisk ud, men
// ikke blev godtaget af serveren (session tilbagekaldt, Supabase-projekt
// skiftet, konto slettet — eller blot et auth-kald, der timede ud):
//   GET /log-ind  → middleware: "cookien er frisk" → /oversigt
//   GET /oversigt → siden: "ingen bruger"          → /log-ind
// Browseren gav op med for mange omdirigeringer, og login-siden kunne
// bogstaveligt talt ikke nås uden at rydde cookies i hånden.

import { describe, expect, it } from "vitest";
import {
  erBeskyttetSti,
  erLogIndSti,
  maaBrugeCookieGenvej,
  sikkerVidereSti,
} from "@/lib/auth/ruter";
import { authCookieNavne } from "@/lib/auth/session-cookie";
import { hentBrugerTilstand, kaldetFejlede } from "@/lib/auth/bruger";

describe("cookie-genvejen må ikke afgøre vejen væk fra log ind", () => {
  it("er slået fra på log ind-siden", () => {
    expect(erLogIndSti("/log-ind")).toBe(true);
    expect(maaBrugeCookieGenvej("/log-ind")).toBe(false);
  });

  it("er stadig slået til inde i appen — hastigheden er ikke rullet tilbage", () => {
    for (const sti of ["/oversigt", "/items/abc", "/nyt-item", "/konto", "/kreditter"]) {
      expect(maaBrugeCookieGenvej(sti)).toBe(true);
    }
  });

  it("beskyttede stier er uændrede", () => {
    expect(erBeskyttetSti("/oversigt")).toBe(true);
    expect(erBeskyttetSti("/log-ind")).toBe(false);
    expect(sikkerVidereSti("//evil.dk")).toBe("/oversigt");
  });
});

describe("den døde cookie kan findes og slettes", () => {
  it("rammer token-cookien og dens bidder", () => {
    const navne = authCookieNavne([
      { name: "sb-abc-auth-token", value: "x" },
      { name: "sb-abc-auth-token.0", value: "y" },
      { name: "sb-abc-auth-token.1", value: "z" },
    ]);
    expect(navne).toEqual([
      "sb-abc-auth-token",
      "sb-abc-auth-token.0",
      "sb-abc-auth-token.1",
    ]);
  });

  it("rører ALDRIG PKCE-verifieren — ellers knækker Google-login midtvejs", () => {
    const navne = authCookieNavne([
      { name: "sb-abc-auth-token-code-verifier", value: "v" },
      { name: "besoeg", value: "1" },
    ]);
    expect(navne).toEqual([]);
  });
});

describe("hentBrugerTilstand skelner et nej fra et kald der fejlede", () => {
  const klient = (svar: unknown) => ({
    auth: {
      getUser: async () => {
        if (svar instanceof Error) throw svar;
        return svar as never;
      },
    },
  });

  it("bruger fundet", async () => {
    const t = await hentBrugerTilstand(
      klient({ data: { user: { id: "u1", email: "a@b.dk" } }, error: null }),
    );
    expect(t.bruger?.id).toBe("u1");
    expect(t.afvist).toBe(false);
    expect(t.fejlede).toBe(false);
  });

  it("udløbet session er et RIGTIGT nej → brugeren skal logge ind igen", async () => {
    const t = await hentBrugerTilstand(
      klient({
        data: { user: null },
        error: { name: "AuthSessionMissingError", status: 400, message: "Auth session missing!" },
      }),
    );
    expect(t.afvist).toBe(true);
    expect(t.fejlede).toBe(false);
  });

  it("ugyldigt token (403) er også et rigtigt nej", async () => {
    const t = await hentBrugerTilstand(
      klient({ data: { user: null }, error: { name: "AuthApiError", status: 403 } }),
    );
    expect(t.afvist).toBe(true);
  });

  it("netværksfejl logger ALDRIG nogen ud", async () => {
    const t = await hentBrugerTilstand(
      klient({
        data: { user: null },
        error: { name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" },
      }),
    );
    expect(t.fejlede).toBe(true);
    expect(t.afvist).toBe(false);
  });

  it("5xx hos Supabase logger heller ikke nogen ud", async () => {
    const t = await hentBrugerTilstand(
      klient({ data: { user: null }, error: { name: "AuthApiError", status: 503 } }),
    );
    expect(t.fejlede).toBe(true);
  });

  it("tidsgrænsen kaster — det er intet svar, ikke et nej", async () => {
    const afbrudt = Object.assign(new Error("The operation was aborted"), {
      name: "TimeoutError",
    });
    const t = await hentBrugerTilstand(klient(afbrudt));
    expect(t.fejlede).toBe(true);
    expect(t.afvist).toBe(false);
  });

  it("intet svar overhovedet tælles som fejlet, ikke som et nej", async () => {
    const t = await hentBrugerTilstand(klient({ data: null, error: null }));
    // Uden fejl OG uden bruger er der ikke andet at tro end et rigtigt nej
    expect(t.afvist).toBe(true);
  });
});

describe("kaldetFejlede", () => {
  it("kender netværksordene", () => {
    expect(kaldetFejlede({ message: "fetch failed" })).toBe(true);
    expect(kaldetFejlede({ name: "AbortError" })).toBe(true);
  });

  it("tager ikke fejl af et almindeligt afslag", () => {
    expect(kaldetFejlede({ name: "AuthApiError", status: 401 })).toBe(false);
    expect(kaldetFejlede(null)).toBe(false);
  });
});
