import { describe, expect, it } from "vitest";
import { haandterStripeEvent } from "@/lib/betaling/webhook";
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

describe("Stripe-webhook (E-2/E-4)", () => {
  it("krediterer ved betalt checkout", async () => {
    const ledger = new MemoryLedgerDb();
    const udfald = await haandterStripeEvent(ledger, checkoutEvent());
    expect(udfald).toEqual({ haandteret: true, userId: "u1", antal: 10 });
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
