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
  /** Skrevet af sælgeren (ejer-ordre 20/8: label læses ikke af AI længere) */
  labelTekst?: string | null;
  farve?: string | null;
  /** Sælgerens selvvalgte hjem-id (S31); null = det deterministiske hjem */
  hjemAnker: string | null;
  /** Onboarding (20/8): "mand"/"kvinde" + hårfarve — styrer person-ankeret */
  koen?: string | null;
  haarFarve?: string | null;
  fotos: { id: string; rolle: FotoRolle; url: string; rensetUrl?: string | null }[];
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
  /** B-8: antal genereringer af en delaftype for et item — loftet pr. del */
  antalGenereringer(itemId: string, kind: "onmodel" | "text"): Promise<number>;
  /** B-8: antal regenereringer (genereringer EFTER første leverance) — loftet
   *  pr. del tæller kun disse, så et item med flere valgte billeder aldrig
   *  blokerer for regenerering alene på grund af sin egen oprindelige kørsel */
  antalRegenereringer(itemId: string, kind: "onmodel" | "text"): Promise<number>;
}

export interface PipelineStorage {
  hentBillede(url: string): Promise<Buffer>;
  /** Gemmer i privat bucket; returnerer storage-stien */
  gemBillede(sti: string, indhold: Buffer): Promise<string>;
}
