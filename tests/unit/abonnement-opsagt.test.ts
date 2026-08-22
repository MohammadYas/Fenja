import { describe, expect, it, vi } from "vitest";

// Modulet er server-only (rører service-nøglen) — markøren kastes i vitest,
// så den mockes væk; de rene funktioner herunder rører hverken Stripe eller DB
vi.mock("server-only", () => ({}));

const { betaltPeriodeSlutMs, giverAdgang } = await import(
  "@/lib/betaling/abonnement"
);

// Ejer-ordre 22/8 (2. runde): en opsigelse må ALDRIG lukke for kreditkøb, før
// den betalte periode er udløbet. Stripe holder normalt status "active" til
// periodens udløb (cancel_at_period_end), men opsiges der med det samme, står
// abonnementet som "canceled" — selvom hele måneden er betalt. Reglen låses
// her: opsagt + resterende betalt periode = stadig abonnent.

const NU = Date.parse("2026-08-22T12:00:00Z");
const OM_EN_UGE = Math.floor(NU / 1000) + 7 * 86_400;
const FOR_EN_UGE_SIDEN = Math.floor(NU / 1000) - 7 * 86_400;

describe("giverAdgang", () => {
  it("aktiv og prøveperiode giver altid adgang", () => {
    expect(giverAdgang({ status: "active" }, NU)).toBe(true);
    expect(giverAdgang({ status: "trialing" }, NU)).toBe(true);
  });

  it("opsagt giver adgang, indtil den betalte periode er udløbet", () => {
    expect(
      giverAdgang({ status: "canceled", current_period_end: OM_EN_UGE }, NU),
    ).toBe(true);
    expect(
      giverAdgang(
        { status: "canceled", current_period_end: FOR_EN_UGE_SIDEN },
        NU,
      ),
    ).toBe(false);
  });

  it("opsagt uden læsbart periodeudløb nægtes — hellere nægte end evig adgang", () => {
    expect(giverAdgang({ status: "canceled" }, NU)).toBe(false);
    expect(
      giverAdgang({ status: "canceled", current_period_end: null }, NU),
    ).toBe(false);
  });

  it("andre statusser (past_due, unpaid, incomplete) giver aldrig adgang", () => {
    for (const status of ["past_due", "unpaid", "incomplete", "paused"]) {
      expect(
        giverAdgang({ status, current_period_end: OM_EN_UGE }, NU),
        status,
      ).toBe(false);
    }
  });
});

describe("betaltPeriodeSlutMs læser begge Stripe-API-former", () => {
  it("gammel form: current_period_end på abonnementet selv", () => {
    expect(
      betaltPeriodeSlutMs({ status: "canceled", current_period_end: OM_EN_UGE }),
    ).toBe(OM_EN_UGE * 1000);
  });

  it("ny form (Basil): current_period_end bor på items — seneste vinder", () => {
    expect(
      betaltPeriodeSlutMs({
        status: "canceled",
        items: {
          data: [
            { current_period_end: FOR_EN_UGE_SIDEN },
            { current_period_end: OM_EN_UGE },
          ],
        },
      }),
    ).toBe(OM_EN_UGE * 1000);
  });

  it("ingen af formerne til stede → null", () => {
    expect(betaltPeriodeSlutMs({ status: "canceled" })).toBe(null);
    expect(
      betaltPeriodeSlutMs({ status: "canceled", items: { data: [] } }),
    ).toBe(null);
  });
});
