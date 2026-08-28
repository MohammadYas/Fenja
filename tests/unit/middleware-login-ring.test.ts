// Selve ringen, kørt igennem middlewaren (ejer-rapport: "kan ikke logge ind").
//
// Opsætningen er en browser med en auth-cookie, der SER frisk ud (udløb langt
// ude i fremtiden), men som serveren afviser. Før fixet svarede middleware på
// cookien alene og sendte brugeren fra /log-ind ind i appen, hvorefter appen
// sendte ham retur — for evigt. Her låses begge ender.

import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://projekt.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

const { NextRequest } = await import("next/server");
const { middleware } = await import("@/middleware");

const FRISK_COOKIE = `base64-${btoa(
  JSON.stringify({ expires_at: Math.floor(Date.now() / 1000) + 3600 }),
)}`;

function request(sti: string, cookie?: string) {
  return new NextRequest(new URL(sti, "https://selja.dk"), {
    headers: cookie ? { cookie } : {},
  });
}

const medFriskCookie = (sti: string) =>
  request(sti, `sb-projekt-auth-token=${FRISK_COOKIE}`);

const AFVIST = { data: { user: null }, error: { name: "AuthApiError", status: 403 } };
const GODKENDT = { data: { user: { id: "u1" } }, error: null };

beforeEach(() => getUser.mockReset());

describe("log ind-siden kan altid nås", () => {
  it("en frisk MEN afvist cookie låser ikke længere log ind-siden", async () => {
    getUser.mockResolvedValue(AFVIST);
    const svar = await middleware(medFriskCookie("/log-ind"));

    // Ingen omdirigering: formularen vises, i stedet for at sende brugeren
    // ind i appen, som straks ville sende ham tilbage hertil
    expect(svar.headers.get("location")).toBeNull();
    expect(getUser).toHaveBeenCalledTimes(1);
    // Og den døde cookie ryddes, så næste request går den rene vej
    const satteCookies = svar.headers.getSetCookie().join(" ");
    expect(satteCookies).toContain("sb-projekt-auth-token=");
    expect(satteCookies.toLowerCase()).toMatch(/max-age=0|expires=thu, 01 jan 1970/);
  });

  it("men en RIGTIG session sender stadig direkte videre (auto-login)", async () => {
    getUser.mockResolvedValue(GODKENDT);
    const svar = await middleware(medFriskCookie("/log-ind?videre=/kreditter"));
    expect(svar.headers.get("location")).toBe("https://selja.dk/kreditter");
  });

  it("uden cookie vises formularen uden et eneste netkald", async () => {
    const svar = await middleware(request("/log-ind"));
    expect(svar.headers.get("location")).toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });
});

describe("app-siderne", () => {
  it("frisk cookie inde i appen springer stadig auth-rundturen over (hastighed)", async () => {
    const svar = await middleware(medFriskCookie("/oversigt"));
    expect(svar.headers.get("location")).toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("afvist session sender til log ind MED en ærlig besked", async () => {
    getUser.mockResolvedValue(AFVIST);
    const svar = await middleware(
      request("/oversigt", "sb-projekt-auth-token=noget-gammelt"),
    );
    expect(svar.headers.get("location")).toBe(
      "https://selja.dk/log-ind?videre=%2Foversigt&besked=session-udloebet",
    );
  });

  it("et FEJLET auth-kald logger ingen ud — siden afgør selv", async () => {
    // Sådan ser en timeout FAKTISK ud fra supabase-js: ingen kastet fejl,
    // men en AuthRetryableFetchError i svaret. Læses den som "ingen bruger",
    // ryger en indlogget bruger ud på login-væggen ved hvert hik.
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" },
    });
    const svar = await middleware(
      request("/oversigt", "sb-projekt-auth-token=noget-gammelt"),
    );
    expect(svar.headers.get("location")).toBeNull();
  });

  it("et fejlet kald lukker heller ikke log ind-siden", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError", status: 0 },
    });
    const svar = await middleware(medFriskCookie("/log-ind"));
    expect(svar.headers.get("location")).toBeNull();
    // Og cookien overlever: den er ikke bevist død, kun ubesvaret
    expect(svar.headers.getSetCookie().join(" ")).not.toContain("Max-Age=0");
  });

  it("uden cookie sendes en beskyttet sti til log ind", async () => {
    const svar = await middleware(request("/oversigt"));
    expect(svar.headers.get("location")).toBe(
      "https://selja.dk/log-ind?videre=%2Foversigt",
    );
    expect(getUser).not.toHaveBeenCalled();
  });
});
