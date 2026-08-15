// Kvitterings-supplement efter kreditkøb (E-2/E-6). Selve kvitteringen sender
// Stripe — denne mail bekræfter kun, at kreditterne er sat ind.
// Emne: emails.kvittering.emne.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Flade, Knap, Overskrift } from "./komponenter";

export type KvitteringMailProps = {
  /** Antal købte kreditter/annoncer */
  antal: number;
  /** Betalt beløb i danske kroner, inkl. moms */
  prisDkk: number;
  /** Link til kreditter-siden */
  saldoUrl: string;
};

export function KvitteringMail({ antal, prisDkk, saldoUrl }: KvitteringMailProps) {
  const kopi = emails.kvittering;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod}</Afsnit>
      <Flade>{kopi.koebslinje(antal, prisDkk)}</Flade>
      <Afsnit>{kopi.udloeb}</Afsnit>
      <Knap href={saldoUrl} tekst={kopi.knap} />
      <Afsnit daempet>{kopi.stripeNote}</Afsnit>
    </EmailRamme>
  );
}
