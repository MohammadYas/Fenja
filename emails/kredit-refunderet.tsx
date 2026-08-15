// "Kredit refunderet"-mail ved delvis leverance (B-6): visualiseringen fejlede,
// rensede fotos + tekst er leveret, og kreditten er sat tilbage automatisk.
// Emne: emails.kreditRefunderet.emne.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, Overskrift } from "./komponenter";

export type KreditRefunderetMailProps = {
  /** Annoncens titel */
  itemTitel: string;
  /** Link til resultatsiden for annoncen */
  itemUrl: string;
};

export function KreditRefunderetMail({
  itemTitel,
  itemUrl,
}: KreditRefunderetMailProps) {
  const kopi = emails.kreditRefunderet;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod(itemTitel)}</Afsnit>
      <Afsnit>{kopi.resten}</Afsnit>
      <Knap href={itemUrl} tekst={kopi.knap} />
      <Afsnit daempet>{kopi.proevIgen}</Afsnit>
    </EmailRamme>
  );
}
