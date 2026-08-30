import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Netlify svarer 202 på en "-background"-funktion FØR handleren kører, så
// afvisningen af et usigneret kald kan ikke ses udefra. Porten bevises hér.

const { koerMock, regenMock } = vi.hoisted(() => ({
  koerMock: vi.fn(),
  regenMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/pipeline/koersel", () => ({
  koerItemSikkert: koerMock,
  koerRegenSikkert: regenMock,
}));

const NOEGLE = "service-nøgle";

import itemKoerselBackground from "@/netlify/funktioner-src/item-koersel-background";

function kald(krop: unknown, signatur?: string, metode = "POST") {
  const tekst = JSON.stringify(krop);
  return itemKoerselBackground(
    new Request("https://selja.dk/.netlify/functions/item-koersel-background", {
      method: metode,
      headers: signatur === undefined ? {} : { "x-selja-signatur": signatur },
      body: metode === "POST" ? tekst : undefined,
    }),
  );
}

function signer(krop: unknown): string {
  return createHmac("sha256", NOEGLE).update(JSON.stringify(krop)).digest("hex");
}

beforeEach(() => {
  koerMock.mockReset().mockResolvedValue(undefined);
  regenMock.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", NOEGLE);
});

describe("item-koersel-background afviser alt uden gyldig signatur", () => {
  it("usigneret kald giver 401 og starter ingen kørsel", async () => {
    const svar = await kald({ slags: "pipeline", itemId: "item-1" });
    expect(svar.status).toBe(401);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("forkert signatur giver 401", async () => {
    const svar = await kald({ slags: "pipeline", itemId: "item-1" }, "0".repeat(64));
    expect(svar.status).toBe(401);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("signatur fra en anden krop giver 401 — den kan ikke genbruges", async () => {
    const svar = await kald(
      { slags: "pipeline", itemId: "offer" },
      signer({ slags: "pipeline", itemId: "angriber" }),
    );
    expect(svar.status).toBe(401);
    expect(koerMock).not.toHaveBeenCalled();
  });

  it("GET afvises med 405", async () => {
    expect((await kald(null, undefined, "GET")).status).toBe(405);
  });
});

describe("item-koersel-background kører den rigtige opgave", () => {
  it("pipeline-opgaven starter kørslen med visningerne", async () => {
    const krop = {
      slags: "pipeline",
      itemId: "item-2",
      presetId: "preset-1",
      visninger: ["spejl", "gulv"],
    };
    const svar = await kald(krop, signer(krop));
    expect(svar.status).toBe(200);
    expect(koerMock).toHaveBeenCalledWith("item-2", "preset-1", ["spejl", "gulv"]);
  });

  it("regen-opgaven starter regenereringen", async () => {
    const krop = {
      slags: "regen",
      itemId: "item-3",
      del: "visualisering",
      requestId: "req-1",
    };
    const svar = await kald(krop, signer(krop));
    expect(svar.status).toBe(200);
    expect(regenMock).toHaveBeenCalledWith("item-3", "visualisering", "req-1", undefined);
  });

  it("ukendt del afvises med 400", async () => {
    const krop = { slags: "regen", itemId: "item-4", del: "alt", requestId: "req-2" };
    expect((await kald(krop, signer(krop))).status).toBe(400);
    expect(regenMock).not.toHaveBeenCalled();
  });

  it("ukendt slags afvises med 400", async () => {
    const krop = { slags: "noget-andet", itemId: "item-5" };
    expect((await kald(krop, signer(krop))).status).toBe(400);
    expect(koerMock).not.toHaveBeenCalled();
  });
});
