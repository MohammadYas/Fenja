// Tekst- og vision-kald (Claude) bag interface, så tests kører mod mock (C-7-princippet).

import type { Markedsinterval } from "@/lib/data/markedspriser";

export type AnnonceTekstInput = {
  maerke: string;
  stoerrelse: string;
  stand: string;
  kategori: string;
  /** Brugerens fejlbeskrivelse — SKAL fremgå af beskrivelsen (D-2) */
  fejlBeskrivelse: string | null;
  /** Aflæst fra label-foto når muligt (D-3) */
  labelTekst: string | null;
  koebsprisDkk: number | null;
  /** M2/D-4: virkelighedstjek fra markedsanalysen (udbudspriser) — valgfrit */
  markedsinterval?: Markedsinterval | null;
};

export type AnnonceTekst = {
  titel: string;
  beskrivelse: string;
  soegeord: string[];
  prisforslagDkk: { fra: number; til: number };
  prisBegrundelse: string;
  costDkk: number;
};

export type TroskabsInput = {
  /** Ægte (renset) foto */
  aegteUrl: string;
  /** Genereret on-model-billede */
  genereretUrl: string;
  /**
   * Visningens slags. Produkt-visninger (gulv/bøjle/nærbillede) har MED VILJE
   * ingen person — de må aldrig dumpe på "tøjet bæres ikke" (ejer-rapport 20/8:
   * kun 1 af 3 billeder leveret, fordi bøjle-reglen slog dem ihjel).
   */
  slags?: "onmodel" | "produkt";
};

export type TroskabsResultat = {
  /** 0–1: samme print/farve/snit? (K1) */
  score: number;
  begrundelse: string;
  costDkk: number;
};

export type LabelInput = {
  labelFotoUrl: string;
};

export type LabelResultat = {
  /** Fx materiale og vaskeanvisning — null hvis ulæseligt */
  tekst: string | null;
  costDkk: number;
};

export interface TextProvider {
  genererAnnonceTekst(input: AnnonceTekstInput): Promise<AnnonceTekst>;
  vurderTroskab(input: TroskabsInput): Promise<TroskabsResultat>;
  aflaesLabel(input: LabelInput): Promise<LabelResultat>;
}
