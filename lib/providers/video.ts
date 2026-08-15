// Fase B (Tillæg B): interfacet defineres nu (H-1), implementeres senere.
// Ingen fase A-beslutning må blokere videopipelinen (H-2).

export type VideoKlipInput = {
  /** UGC-script for klippet (fra prompt-compileren, Tillæg B) */
  script: string;
  /** Referencebilleder (@image1…) */
  referenceUrls: string[];
  varighedSek: number;
  format: "9:16" | "16:9" | "1:1";
};

export type VideoKlipResultat = {
  url: string;
  providerJobId: string;
  costDkk: number;
};

export interface VideoProvider {
  genererKlip(input: VideoKlipInput): Promise<VideoKlipResultat>;
}
