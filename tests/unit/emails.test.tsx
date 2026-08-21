import { describe, expect, it } from "vitest";
import { AnnonceKlarMail } from "@/emails/annonce-klar";
import { KreditRefunderetMail } from "@/emails/kredit-refunderet";
import { KvitteringMail } from "@/emails/kvittering";
import { MagicLinkMail } from "@/emails/magic-link";
import { renderMailHtml } from "@/emails/render";
import { SalgsplanMail } from "@/emails/salgsplan";
import { VelkomstMail } from "@/emails/velkomst";
import { emails } from "@/lib/copy/emails";
import {
  MockEmailAfsender,
  ResendEmailAfsender,
  hentEmailAfsender,
} from "@/lib/emails/send";

// Alle skabeloner skal rendere til komplet, mail-kompatibel HTML uden fejl:
// tabel-layout, inline styles, ingen klasser (Tailwind virker ikke i mails).

const LINK = "https://eksempel.dk/auth/bekraeft?token=abc123";
const ITEM_URL = "https://eksempel.dk/items/i1";
const TITEL = "Mørkeblå uldstrik · str. M";

const skabeloner = [
  {
    navn: "magic link",
    emne: emails.magicLink.emne,
    element: <MagicLinkMail linkUrl={LINK} />,
    skalIndeholde: [LINK, emails.magicLink.knap],
  },
  {
    navn: "velkomst",
    emne: emails.velkomst.emne,
    element: <VelkomstMail startUrl={ITEM_URL} />,
    skalIndeholde: [ITEM_URL, emails.velkomst.knap],
  },
  {
    navn: "annonce klar",
    emne: emails.annonceKlar.emne(TITEL),
    element: <AnnonceKlarMail itemTitel={TITEL} itemUrl={ITEM_URL} />,
    skalIndeholde: [TITEL, ITEM_URL, emails.annonceKlar.knap],
  },
  {
    navn: "kvitterings-supplement",
    emne: emails.kvittering.emne,
    element: <KvitteringMail antal={10} prisDkk={29} saldoUrl={ITEM_URL} />,
    skalIndeholde: [emails.kvittering.koebslinje(10, 29), ITEM_URL],
  },
  {
    navn: "kredit refunderet",
    emne: emails.kreditRefunderet.emne,
    element: <KreditRefunderetMail itemTitel={TITEL} itemUrl={ITEM_URL} />,
    skalIndeholde: [TITEL, ITEM_URL, emails.kreditRefunderet.knap],
  },
  {
    navn: "ugens salgsplan",
    emne: emails.salgsplan.emne(2),
    element: (
      <SalgsplanMail
        punkter={[
          { itemId: "i1", titel: TITEL, handling: "saetNed", tekst: "Har ligget 21 dage - saet ned til 120 kr.", foreslaaetPrisDkk: 120 },
          { itemId: "i2", titel: "Sort hoodie str. S", handling: "vent", tekst: "Bedst i oktober - vent." },
        ]}
        oversigtUrl={ITEM_URL}
      />
    ),
    skalIndeholde: [TITEL, ITEM_URL, emails.salgsplan.handlinger.saetNed, emails.salgsplan.knap],
  },
];

describe("mail-skabeloner renderer til mail-kompatibel HTML", () => {
  it.each(skabeloner)(
    "$navn renderer uden fejl med indhold og links",
    async ({ emne, element, skalIndeholde }) => {
      const html = await renderMailHtml(emne, element);
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).toContain(`<title>${emne}</title>`);
      for (const tekst of skalIndeholde) expect(html).toContain(tekst);
    },
  );

  it.each(skabeloner)(
    "$navn bruger tabeller og inline styles — ingen klasser",
    async ({ emne, element }) => {
      const html = await renderMailHtml(emne, element);
      expect(html).toContain('<table role="presentation"');
      expect(html).toContain('style="');
      expect(html).not.toContain('class="'); // Tailwind-klasser virker ikke i mails
    },
  );

  it.each(skabeloner)("$navn har footer og preheader", async ({ emne, element }) => {
    const html = await renderMailHtml(emne, element);
    expect(html).toContain(emails.faelles.footer);
    expect(html).toContain(emails.faelles.footerHvorfor);
  });
});

describe("EmailAfsender", () => {
  it("mock registrerer beskeder uden netværk og giver stigende id'er", async () => {
    const afsender = new MockEmailAfsender();
    const besked = { til: "a@b.dk", emne: "Test", html: "<p>hej</p>" };
    const kvittering = await afsender.send(besked);
    expect(kvittering.id).toBe("mock-1");
    expect(afsender.sendte).toEqual([besked]);
    expect((await afsender.send(besked)).id).toBe("mock-2");
  });

  it("hentEmailAfsender giver mock uden RESEND_API_KEY", () => {
    const original = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;
    try {
      expect(hentEmailAfsender()).toBeInstanceOf(MockEmailAfsender);
    } finally {
      if (original !== undefined) process.env.RESEND_API_KEY = original;
    }
  });

  it("hentEmailAfsender respekterer MOCK_PROVIDERS=1 selv med nøgle", () => {
    const originalMock = process.env.MOCK_PROVIDERS;
    const originalKey = process.env.RESEND_API_KEY;
    process.env.MOCK_PROVIDERS = "1";
    process.env.RESEND_API_KEY = "re_testnoegle";
    try {
      expect(hentEmailAfsender()).toBeInstanceOf(MockEmailAfsender);
    } finally {
      if (originalMock === undefined) delete process.env.MOCK_PROVIDERS;
      else process.env.MOCK_PROVIDERS = originalMock;
      if (originalKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalKey;
    }
  });

  it("hentEmailAfsender giver Resend-afsender med nøgle", () => {
    const originalMock = process.env.MOCK_PROVIDERS;
    const originalKey = process.env.RESEND_API_KEY;
    delete process.env.MOCK_PROVIDERS;
    process.env.RESEND_API_KEY = "re_testnoegle";
    try {
      expect(hentEmailAfsender()).toBeInstanceOf(ResendEmailAfsender);
    } finally {
      if (originalMock !== undefined) process.env.MOCK_PROVIDERS = originalMock;
      if (originalKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalKey;
    }
  });
});
