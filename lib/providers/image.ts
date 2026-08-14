// Alle billed-provider-kald går gennem dette interface (C-7), så modellen kan
// skiftes og tests/CI kan køre mod mock uden nøgler (NFR-5).

export type BaggrundsrensInput = {
  fotoUrl: string;
};

export type BaggrundsrensResultat = {
  /** URL til det rensede billede hos provideren (hentes og gemmes i eget storage) */
  url: string;
  costDkk: number;
};

export type OnModelInput = {
  /** Ægte foto som styrende reference — styrer tøjets udseende (C-2) */
  referenceUrl: string;
  /** Prompt styrer KUN person/positur/setting, aldrig tøjet (SPEC §9) */
  prompt: string;
  /** 0–1; hæves ved retry efter fejlet troskabs-tjek (C-3) */
  referenceVaegt: number;
};

export type OnModelResultat = {
  url: string;
  providerJobId: string;
  costDkk: number;
};

export interface ImageProvider {
  rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat>;
  genererOnModel(input: OnModelInput): Promise<OnModelResultat>;
}
