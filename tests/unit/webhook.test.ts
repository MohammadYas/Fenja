import { describe, expect, it } from "vitest";
import { haandterStripeEvent } from "@/lib/betaling/webhook";
import { stripePriser } from "@/lib/config";
import { MemoryLedgerDb } from "@/lib/credits/memory";

function checkoutEvent(overrides: Partial<{
  id: string;
  type: string;
  payment_status: string;
  metadata: Record<string, string>;
}> = {}) {
  return {
    id: overrides.id ?? "evt_1",
    type: overrides.type ?? "checkout.session.completed",
    data: {
      object: {
        payment_status: overrides.payment_status ?? "paid",
        metadata: overrides.metadata ?? { userId: "u1", antalKreditter: "10" },
      },
    },
  };
}

function fakturaEvent(overrides: Partial<{
  id: string;
  fakturaId: string;
  status: string;
  prisId: string;
  metadata: Record<string, string>;
}> = {}) {
  return {
    id: overrides.id ?? "evt_inv_1",
    type: "invoice.paid",
    data: {
      object: {
        id: overrides.fakturaId ?? "in_1",
        status: overrides.status ?? "paid",
        subscription_details: {
          metadata: overrides.metadata ?? { userId: "u1" },
        },
        lines: { data: [{ price: { id: overrides.prisId ?? stripePriser.plusMd } }] },
      },
    },
  };
}

describe("Stripe-webhook (E-2/E-4)", () => {
  it("krediterer ved betalt checkout", async () => {
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(ledger, checkoutEvent());
    expect(udfald).toEqual({ haandteret: true, slags: "pakke", userId: "u1", antal: 10 });
    expect(await ledger.hentSaldo("u1")).toBe(10);
  });

  it("dublet-event krediterer ikke dobbelt (E-4)", async () => {
    const ledger = new MemoryLedgerDb();
    await haandterStripeEvent(ledger, checkoutEvent());
    await haandterStripeEvent(ledger, checkoutEvent());
    expect(await ledger.hentSaldo("u1")).toBe(10);
  });

  it("ubetalt session og fremmede event-typer ignoreres", async () => {
    const ledger = new MemoryLedgerDb();
    const ubetalt = await haandterStripeEvent(
      ledger,
      checkoutEvent({ payment_status: "unpaid" }),
    );
    expect(ubetalt.haandteret).toBe(false);
    const fremmed = await haandterStripeEvent(
      ledger,
      checkoutEvent({ type: "invoice.created" }),
    );
    expect(fremmed.haandteret).toBe(false);
    expect(await ledger.hentSaldo("u1")).toBe(0);
  });

  it("manglende metadata afvises uden kreditering", async () => {
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(ledger, checkoutEvent({ metadata: {} }));
    expect(udfald.haandteret).toBe(false);
    expect(await ledger.hentSaldo("u1")).toBe(0);
  });
});

describe("Stripe-webhook: top-up og abonnementer (pricing v3.0)", () => {
  it("koebstype=topup krediterer som top-up (brændes før pakker)", async () => {
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(
      ledger,
      checkoutEvent({
        metadata: { userId: "u1", antalKreditter: "10", koebstype: "topup" },
      }),
    );
    expect(udfald).toEqual({ haandteret: true, slags: "topup", userId: "u1", antal: 10 });
    const status = await ledger.hentStatus("u1");
    expect(status.prKilde.topup).toBe(10);
  });

  it("dahlia-formen (parent + pricing.price_details) krediterer også — 10. root cause 21/8", async () => {
    // Stripe 2025+ flyttede felterne: subscription_details bor under parent,
    // og linjens price under pricing.price_details. Det FØRSTE rigtige køb
    // blev tabt på gulvet, fordi handleren kun læste den gamle form og
    // svarede 200 — Stripe prøvede derfor aldrig igen.
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(ledger, {
      id: "evt_dahlia",
      type: "invoice.paid",
      data: {
        object: {
          id: "in_dahlia",
          status: "paid",
          parent: { subscription_details: { metadata: { userId: "u9" } } },
          lines: { data: [{ pricing: { price_details: { price: stripePriser.plusMd } } }] },
        },
      },
    });
    expect(udfald).toEqual({
      haandteret: true,
      slags: "abonnement",
      userId: "u9",
      tier: "plus",
    });
    const status = await ledger.hentStatus("u9");
    expect(status.prKilde.subscription).toBe(12);
  });
  it("betalt faktura giver månedskvoten for tierens pris-id", async () => {
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(ledger, fakturaEvent());
    expect(udfald).toEqual({
      haandteret: true,
      slags: "abonnement",
      userId: "u1",
      tier: "plus",
    });
    const status = await ledger.hentStatus("u1");
    expect(status.prKilde.subscription).toBe(12); // Plus: 12 annoncer/md.
  });

  it("samme faktura giver aldrig dobbelt kvote (E-4)", async () => {
    const ledger = new MemoryLedgerDb();
    await haandterStripeEvent(ledger, fakturaEvent());
    await haandterStripeEvent(ledger, fakturaEvent({ id: "evt_inv_retry" }));
    expect(await ledger.hentSaldo("u1")).toBe(12);
  });

  it("ny faktura (næste måned) giver ny kvote — op til rollover-loftet", async () => {
    const ledger = new MemoryLedgerDb();
    await haandterStripeEvent(ledger, fakturaEvent({ fakturaId: "in_1" }));
    await haandterStripeEvent(ledger, fakturaEvent({ fakturaId: "in_2", id: "evt_inv_2" }));
    await haandterStripeEvent(ledger, fakturaEvent({ fakturaId: "in_3", id: "evt_inv_3" }));
    expect(await ledger.hentSaldo("u1")).toBe(24); // loft: 2 × 12
  });

  it("ukendt pris-id og manglende userId afvises uden kreditering", async () => {
    const ledger = new MemoryLedgerDb();
    const ukendt = await haandterStripeEvent(
      ledger,
      fakturaEvent({ prisId: "price_ukendt" }),
    );
    expect(ukendt.haandteret).toBe(false);
    const udenBruger = await haandterStripeEvent(ledger, fakturaEvent({ metadata: {} }));
    expect(udenBruger.haandteret).toBe(false);
    expect(await ledger.hentSaldo("u1")).toBe(0);
  });

  it("Pro-årsprisen rammer Pro-kvoten", async () => {
    const ledger = new MemoryLedgerDb();
    await haandterStripeEvent(ledger, fakturaEvent({ prisId: stripePriser.proAar }));
    const status = await ledger.hentStatus("u1");
    expect(status.prKilde.subscription).toBe(30); // Pro: 30 annoncer/md.
  });
});
