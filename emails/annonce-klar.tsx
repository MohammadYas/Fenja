// "Din annonce er klar"-mail (efter fuld leverance, B-5).
// Emne: emails.annonceKlar.emne(itemTitel).

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, Overskrift } from "./komponenter";

export type AnnonceKlarMailProps = {
  /** Annoncens titel, fx "Mørkeblå uldstrik · str. M" */
  itemTitel: string;
  /** Link til resultatsiden for annoncen */
  itemUrl: string;
};

export function AnnonceKlarMail({ itemTitel, itemUrl }: AnnonceKlarMailProps) {
  const kopi = emails.annonceKlar;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod(itemTitel)}</Afsnit>
      <Afsnit>{kopi.huskBillede1}</Afsnit>
      <Knap href={itemUrl} tekst={kopi.knap} />
    </EmailRamme>
  );
}
