// Datalag for pipelinen bag interface, så runneren kan testes uden Supabase.

import type { AnnonceTekst } from "@/lib/providers/text";

export type FotoRolle = "full" | "back" | "label" | "defect";

export type ItemTilPipeline = {
  id: string;
  userId: string;
  maerke: string;
  stoerrelse: string;
  stand: string;
  kategori: string;
  fejlBeskrivelse: string | null;
  koebsprisDkk: number | null;
  fotos: { id: string; rolle: FotoRolle; url: string }[];
};

export type GenereringsSlut = {
  status: "succeeded" | "failed";
  costDkk: number;
  outputUrl?: string;
  fidelityScore?: number;
  promptVersion?: string;
  providerJobId?: string;
};

export interface PipelineDb {
  hentItem(itemId: string): Promise<ItemTilPipeline>;
  /** Opretter generations-række med status running — progress-visning læser den (B-4) */
  startGenerering(
    itemId: string,
    kind: "cleanup" | "onmodel" | "text",
    presetId?: string,
  ): Promise<string>;
  afslutGenerering(genereringsId: string, slut: GenereringsSlut): Promise<void>;
  gemRensetFoto(fotoId: string, cleanedUrl: string): Promise<void>;
  gemAnnonceTekst(itemId: string, tekst: AnnonceTekst): Promise<void>;
  markerLeveret(itemId: string): Promise<void>;
  /** Summen af alle generations-omkostninger i dag — budgetloftet (E-5/G-1) */
  dagensOmkostningerDkk(): Promise<number>;
}

export interface PipelineStorage {
  hentBillede(url: string): Promise<Buffer>;
  /** Gemmer i privat bucket; returnerer storage-stien */
  gemBillede(sti: string, indhold: Buffer): Promise<string>;
}
