// Fase B (Tillæg B): det fulde VideoProvider-interface til Seedance-klassens
// modeller via fal. Async jobmodel (submit → status/webhook → resultat), fordi
// videogenerering tager minutter — samme princip som ImageProvider (C-7):
// alle provider-kald bag interface, så tests/CI kører mod mock uden nøgler.
//
// BEMÆRK: lib/providers/video.ts er S3-stubben (H-1) og bevares urørt af
// hensyn til eksisterende imports. Dette modul er den komplette fase B-version
// og afløser stubben, når videopipelinen implementeres (se docs/sessions/).

export type VideoFormat = "9:16" | "16:9" | "1:1";

/** Seedance 2.0-tilstande: tekst-, billed- eller referencestyret video */
export type VideoTilstand = "t2v" | "i2v" | "r2v";

export type VideoJobInput = {
  /** Færdig promptstreng fra prompt-compileren (8 blokke, se prompt-compiler.ts) */
  prompt: string;
  /** Compilerens version — gemmes på generations.prompt_version (FR-15) */
  promptVersion: number;
  tilstand: VideoTilstand;
  /** Referencebilleder i @image1…-rækkefølge (tom liste ved t2v) */
  referenceUrls: string[];
  /** Klipvarighed i sekunder (Seedance: 4–15 s) */
  varighedSek: number;
  format: VideoFormat;
  /** Kaldes af provideren ved jobafslutning — null når der polles i stedet */
  webhookUrl: string | null;
};

/** Kvittering ved indsendelse — jobbet kører videre hos provideren */
export type VideoJobKvittering = {
  providerJobId: string;
};

export type VideoJobStatus =
  | { fase: "i-koe" }
  | { fase: "genererer" }
  | { fase: "faerdig" }
  | { fase: "fejlet"; fejl: string };

export type VideoResultat = {
  /** URL til det færdige klip hos provideren (hentes og gemmes i eget storage) */
  url: string;
  varighedSek: number;
  format: VideoFormat;
  costDkk: number;
};

/**
 * Payload som providerens webhook poster ved jobafslutning.
 * Behandles ALTID idempotent (NFR-3/E-4): dubletter må aldrig koste dobbelt.
 */
export type VideoWebhookPayload =
  | { providerJobId: string; udfald: "faerdig"; resultat: VideoResultat }
  | { providerJobId: string; udfald: "fejlet"; fejl: string };

export interface VideoProvider {
  /** Indsender et genereringsjob; returnerer straks (async jobmodel) */
  indsendJob(input: VideoJobInput): Promise<VideoJobKvittering>;
  /** Poller jobbets tilstand — alternativ til webhook */
  hentStatus(providerJobId: string): Promise<VideoJobStatus>;
  /** Henter det færdige klip; kaster hvis jobbet ikke er i fase "faerdig" */
  hentResultat(providerJobId: string): Promise<VideoResultat>;
}
