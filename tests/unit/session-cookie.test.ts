// Session-cookie-læsningen bag middleware-fast-path'en (23/8 aften: "den
// loader så langsomt"). Reglen der låses her: netkaldet må KUN springes
// over, når cookien LÆSELIGT siger at der er god tid til udløb — alt
// uklart falder tilbage til den normale netvej.

import { describe, expect, it } from "vitest";
import {
  sekunderTilSessionUdloeb,
  sessionErFrisk,
} from "@/lib/auth/session-cookie";

const NU_MS = 1_756_000_000_000; // fast "nu", så testene er deterministiske
const NU_SEK = NU_MS / 1000;

function cookie(expiresAt: number, base64 = true) {
  const json = JSON.stringify({ access_token: "x", expires_at: expiresAt });
  return {
    name: "sb-abc-auth-token",
    value: base64 ? `base64-${btoa(json)}` : json,
  };
}

describe("sekunderTilSessionUdloeb", () => {
  it("læser udløb af en base64-cookie", () => {
    const om = sekunderTilSessionUdloeb([cookie(NU_SEK + 3600)], NU_MS);
    expect(om).toBe(3600);
  });

  it("læser også det rå JSON-format", () => {
    expect(sekunderTilSessionUdloeb([cookie(NU_SEK + 600, false)], NU_MS)).toBe(600);
  });

  it("samler en cookie delt i bidder, i rigtig rækkefølge", () => {
    const fuld = `base64-${btoa(JSON.stringify({ expires_at: NU_SEK + 900 }))}`;
    const midt = Math.floor(fuld.length / 2);
    const bidder = [
      // Bevidst i omvendt orden — sorteringen skal rette dem
      { name: "sb-abc-auth-token.1", value: fuld.slice(midt) },
      { name: "sb-abc-auth-token.0", value: fuld.slice(0, midt) },
    ];
    expect(sekunderTilSessionUdloeb(bidder, NU_MS)).toBe(900);
  });

  it("giver null ved ingen auth-cookie, ukendt format og manglende udløb", () => {
    expect(sekunderTilSessionUdloeb([], NU_MS)).toBeNull();
    expect(
      sekunderTilSessionUdloeb(
        [{ name: "sb-abc-auth-token", value: "ikke-json" }],
        NU_MS,
      ),
    ).toBeNull();
    expect(
      sekunderTilSessionUdloeb(
        [{ name: "sb-abc-auth-token", value: `base64-${btoa("{}")}` }],
        NU_MS,
      ),
    ).toBeNull();
  });

  it("rører ikke cookies der ikke er auth-tokens", () => {
    expect(
      sekunderTilSessionUdloeb([{ name: "sb-abc-refresh", value: "x" }], NU_MS),
    ).toBeNull();
  });
});

describe("sessionErFrisk", () => {
  it("frisk når der er god tid til udløb — netkaldet kan springes over", () => {
    expect(sessionErFrisk([cookie(NU_SEK + 3600)], 120, NU_MS)).toBe(true);
  });

  it("IKKE frisk tæt på udløb — fornyelsen skal ske i god tid", () => {
    expect(sessionErFrisk([cookie(NU_SEK + 60)], 120, NU_MS)).toBe(false);
  });

  it("IKKE frisk efter udløb", () => {
    expect(sessionErFrisk([cookie(NU_SEK - 10)], 120, NU_MS)).toBe(false);
  });

  it("alt ulæseligt falder tilbage til netvejen — aldrig fast-path i blinde", () => {
    expect(sessionErFrisk([], 120, NU_MS)).toBe(false);
    expect(
      sessionErFrisk([{ name: "sb-abc-auth-token", value: "korrupt" }], 120, NU_MS),
    ).toBe(false);
  });
});
