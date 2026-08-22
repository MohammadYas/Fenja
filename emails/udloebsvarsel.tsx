// "Dine kreditter udløber snart"-mail (ejer-ordre 22/8). Ærlig og uden pres:
// den fortæller hvornår og hvor mange, og hvad man kan gøre ved det.

import { emails } from "@/lib/copy/emails";
import { Afsnit, EmailRamme, Knap, Overskrift } from "./komponenter";

export type UdloebsvarselMailProps = {
  antal: number;
  dato: string;
  kreditUrl: string;
};

export function UdloebsvarselMail({ antal, dato, kreditUrl }: UdloebsvarselMailProps) {
  const kopi = emails.udloebsvarsel;
  return (
    <EmailRamme forhaandsvisning={kopi.forhaandsvisning}>
      <Overskrift>{kopi.overskrift}</Overskrift>
      <Afsnit>{kopi.brod(antal, dato)}</Afsnit>
      <Afsnit>{kopi.forslag}</Afsnit>
      <Knap href={kreditUrl} tekst={kopi.knap} />
      <Afsnit daempet>{kopi.hvorfor}</Afsnit>
    </EmailRamme>
  );
}
