// Tynd afsender-abstraktion over Resend — samme mønster som lib/providers:
// interface + mock, så alt kan testes uden nøgle (NFR-5), og rigtig
// implementering først når RESEND_API_KEY findes. INTET i appen kalder send()
// endnu — kobling til auth/pipeline/webhooks er en senere integrationsopgave.

export type EmailBesked = {
  til: string;
  emne: string;
  /** Færdigrenderet dokument fra emails/render.tsx */
  html: string;
};

export type EmailKvittering = {
  /** Afsenderens id for beskeden (mock: "mock-<n>") */
  id: string;
};

export interface EmailAfsender {
  send(besked: EmailBesked): Promise<EmailKvittering>;
}

/** Registrerer beskeder i stedet for at sende — til tests, CI og udvikling. */
export class MockEmailAfsender implements EmailAfsender {
  readonly sendte: EmailBesked[] = [];

  async send(besked: EmailBesked): Promise<EmailKvittering> {
    this.sendte.push(besked);
    return { id: `mock-${this.sendte.length}` };
  }
}

export class ResendEmailAfsender implements EmailAfsender {
  constructor(
    private readonly apiKey: string,
    private readonly fra: string,
  ) {}

  async send(besked: EmailBesked): Promise<EmailKvittering> {
    // Dynamisk import, så mock-stien (CI uden nøgler) aldrig loader SDK'et.
    const { Resend } = await import("resend");
    const resend = new Resend(this.apiKey);
    const { data, error } = await resend.emails.send({
      from: this.fra,
      to: besked.til,
      subject: besked.emne,
      html: besked.html,
    });
    if (error || !data) {
      throw new Error(`Resend afviste mailen: ${error?.message ?? "ukendt fejl"}`);
    }
    return { id: data.id };
  }
}

const FALLBACK_AFSENDER = "Fenja <onboarding@resend.dev>";

/** Rigtig afsender når nøglen findes, ellers mock. Tving mock med MOCK_PROVIDERS=1. */
export function hentEmailAfsender(): EmailAfsender {
  const apiKey = process.env.RESEND_API_KEY;
  if (process.env.MOCK_PROVIDERS === "1" || !apiKey) return new MockEmailAfsender();
  return new ResendEmailAfsender(apiKey, process.env.RESEND_FROM ?? FALLBACK_AFSENDER);
}
