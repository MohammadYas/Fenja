import { describe, expect, it, vi } from "vitest";
import { emails } from "@/lib/copy/emails";
import {
  bedstMuligt,
  sendAnnonceKlar,
  sendKreditRefunderet,
  sendKvittering,
  sendVelkomst,
} from "@/lib/emails/notifikationer";
import { MockEmailAfsender } from "@/lib/emails/send";

// S32: hver notifikations-helper renderer den rigtige skabelon + emne og sender
// til den rigtige modtager gennem en injiceret afsender (mock i test/CI).

const TIL = "saelger@eksempel.dk";
const ITEM_URL = "https://selja.studio/items/i1";
const START_URL = "https://selja.studio/nyt-item";
const SALDO_URL = "https://selja.studio/kreditter";
const TITEL = "Mørkeblå uldstrik · str. M";

describe("transaktionsmail-helpers (S32)", () => {
  it("velkomst: emne, modtager og start-link", async () => {
    const afsender = new MockEmailAfsender();
    const kvit = await sendVelkomst(afsender, { til: TIL, startUrl: START_URL });

    expect(kvit.id).toBe("mock-1");
    expect(afsender.sendte).toHaveLength(1);
    const besked = afsender.sendte[0]!;
    expect(besked.til).toBe(TIL);
    expect(besked.emne).toBe(emails.velkomst.emne);
    expect(besked.html).toContain(START_URL);
    expect(besked.html).toContain(emails.velkomst.knap);
    // Komplet mail-dokument
    expect(besked.html.startsWith("<!doctype html>")).toBe(true);
  });

  it("kvittering: emne, køb-linje og saldo-link", async () => {
    const afsender = new MockEmailAfsender();
    await sendKvittering(afsender, {
      til: TIL,
      antal: 10,
      prisDkk: 29,
      saldoUrl: SALDO_URL,
    });

    const besked = afsender.sendte[0]!;
    expect(besked.til).toBe(TIL);
    expect(besked.emne).toBe(emails.kvittering.emne);
    expect(besked.html).toContain(emails.kvittering.koebslinje(10, 29));
    expect(besked.html).toContain(SALDO_URL);
  });

  it("annonce klar: emne med titel, brødtekst og item-link", async () => {
    const afsender = new MockEmailAfsender();
    await sendAnnonceKlar(afsender, { til: TIL, itemTitel: TITEL, itemUrl: ITEM_URL });

    const besked = afsender.sendte[0]!;
    expect(besked.emne).toBe(emails.annonceKlar.emne(TITEL));
    expect(besked.emne).toContain(TITEL);
    expect(besked.html).toContain(ITEM_URL);
    expect(besked.html).toContain(emails.annonceKlar.knap);
  });

  it("kredit refunderet: emne, titel i brødtekst og item-link", async () => {
    const afsender = new MockEmailAfsender();
    await sendKreditRefunderet(afsender, {
      til: TIL,
      itemTitel: TITEL,
      itemUrl: ITEM_URL,
    });

    const besked = afsender.sendte[0]!;
    expect(besked.emne).toBe(emails.kreditRefunderet.emne);
    expect(besked.html).toContain(TITEL);
    expect(besked.html).toContain(ITEM_URL);
    expect(besked.html).toContain(emails.kreditRefunderet.knap);
  });
});

describe("bedstMuligt: mails er aldrig kritiske", () => {
  it("sluger en fejl fra afsenderen og kaster ikke videre", async () => {
    const fejlLog = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      bedstMuligt(async () => {
        throw new Error("Resend nede");
      }),
    ).resolves.toBeUndefined();
    expect(fejlLog).toHaveBeenCalledOnce();
    fejlLog.mockRestore();
  });

  it("kører den lykkelige vej uden at logge fejl", async () => {
    const fejlLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const afsender = new MockEmailAfsender();
    await bedstMuligt(() => sendVelkomst(afsender, { til: TIL, startUrl: START_URL }));
    expect(afsender.sendte).toHaveLength(1);
    expect(fejlLog).not.toHaveBeenCalled();
    fejlLog.mockRestore();
  });
});
