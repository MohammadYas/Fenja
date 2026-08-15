// Velkomstmail efter første login. Emne: emails.velkomst.emne.
// BEMÆRK: gratis-tier er afskaffet (STATUS 2026-08-15) — mailen lover ingen
// gratis annoncer; kreditNote forklarer købsmodellen i stedet.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, Overskrift, Trinliste } from "./komponenter";

export type VelkomstMailProps = {
  /** Link til "Nyt item"-flowet */
  startUrl: string;
};

export function VelkomstMail({ startUrl }: VelkomstMailProps) {
  const kopi = emails.velkomst;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod}</Afsnit>
      <Trinliste trin={kopi.trin} />
      <Afsnit>{kopi.kreditNote}</Afsnit>
      <Knap href={startUrl} tekst={kopi.knap} />
    </EmailRamme>
  );
}
