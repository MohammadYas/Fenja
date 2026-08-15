// Magic link-mail (A-1). Emne: emails.magicLink.emne.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, KnapFallback, Overskrift } from "./komponenter";

export type MagicLinkMailProps = {
  /** Det færdige login-link (Supabase magic link) */
  linkUrl: string;
};

export function MagicLinkMail({ linkUrl }: MagicLinkMailProps) {
  const kopi = emails.magicLink;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod}</Afsnit>
      <Knap href={linkUrl} tekst={kopi.knap} />
      <KnapFallback href={linkUrl} />
      <Afsnit daempet>{kopi.ikkeDig}</Afsnit>
    </EmailRamme>
  );
}
