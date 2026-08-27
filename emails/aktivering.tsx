// Aktiverings-nudge til brugere der tilmeldte sig og aldrig lagde noget op.
// Emne: emails.aktivering.emne. Sendes ÉN gang pr. bruger — se
// lib/aktivering/nudge.ts for udvælgelsen og stemplingen.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, Overskrift, Trinliste } from "./komponenter";

export type AktiveringsMailProps = {
  /** Link til "Nyt item"-flowet */
  startUrl: string;
};

export function AktiveringsMail({ startUrl }: AktiveringsMailProps) {
  const kopi = emails.aktivering;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod}</Afsnit>
      <Trinliste trin={kopi.trin} />
      <Knap href={startUrl} tekst={kopi.knap} />
      <Afsnit>{kopi.hjaelpNote}</Afsnit>
    </EmailRamme>
  );
}
