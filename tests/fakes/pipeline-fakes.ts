// In-memory-fakes af PipelineDb og PipelineStorage til runner-tests.

import type { AnnonceTekst } from "@/lib/providers/text";
import type {
  GenereringsSlut,
  ItemTilPipeline,
  PipelineDb,
  PipelineStorage,
} from "@/lib/pipeline/db";

export function testItem(overrides: Partial<ItemTilPipeline> = {}): ItemTilPipeline {
  return {
    id: "item-1",
    userId: "user-1",
    maerke: "Ganni",
    stoerrelse: "M",
    stand: "God",
    kategori: "Striktrøje",
    fejlBeskrivelse: "lille hul ved venstre søm",
    koebsprisDkk: null,
    hjemAnker: null,
    fotos: [
      { id: "f1", rolle: "full", url: "https://x/helhed.jpg" },
      { id: "f2", rolle: "label", url: "https://x/label.jpg" },
    ],
    ...overrides,
  };
}

type Generering = {
  id: string;
  itemId: string;
  kind: string;
  presetId?: string;
  status: string;
  costDkk: number;
  fidelityScore?: number;
  promptVersion?: string;
  createdAt?: string;
};

export class FakePipelineDb implements PipelineDb {
  generings: Generering[] = [];
  rensedeFotos = new Map<string, string>();
  tekster = new Map<string, AnnonceTekst>();
  leverede: string[] = [];
  dagensForbrug = 0;
  leveretAt: string | null = null;

  constructor(private item: ItemTilPipeline = testItem()) {}

  async hentItem(): Promise<ItemTilPipeline> {
    return this.item;
  }

  async startGenerering(
    itemId: string,
    kind: "cleanup" | "onmodel" | "text",
    presetId?: string,
  ): Promise<string> {
    const id = `gen-${this.generings.length + 1}`;
    this.generings.push({
      id,
      itemId,
      kind,
      presetId,
      status: "running",
      costDkk: 0,
      createdAt: new Date().toISOString(),
    });
    return id;
  }

  async afslutGenerering(genereringsId: string, slut: GenereringsSlut): Promise<void> {
    const gen = this.generings.find((g) => g.id === genereringsId);
    if (!gen) throw new Error("ukendt generering");
    gen.status = slut.status;
    gen.costDkk = slut.costDkk;
    gen.fidelityScore = slut.fidelityScore;
    gen.promptVersion = slut.promptVersion;
  }

  async gemRensetFoto(fotoId: string, cleanedUrl: string): Promise<void> {
    this.rensedeFotos.set(fotoId, cleanedUrl);
  }

  async gemAnnonceTekst(itemId: string, tekst: AnnonceTekst): Promise<void> {
    this.tekster.set(itemId, tekst);
  }

  async markerLeveret(itemId: string): Promise<void> {
    this.leverede.push(itemId);
    this.leveretAt = new Date().toISOString();
  }

  async dagensOmkostningerDkk(): Promise<number> {
    return this.dagensForbrug;
  }

  async antalGenereringer(itemId: string, kind: "onmodel" | "text"): Promise<number> {
    return this.generings.filter((g) => g.itemId === itemId && g.kind === kind).length;
  }

  async antalRegenereringer(itemId: string, kind: "onmodel" | "text"): Promise<number> {
    if (!this.leveretAt) return 0;
    return this.generings.filter(
      (g) =>
        g.itemId === itemId &&
        g.kind === kind &&
        (g.createdAt ?? "") >= this.leveretAt!,
    ).length;
  }
}

export class FakePipelineStorage implements PipelineStorage {
  gemte = new Map<string, Buffer>();

  async hentBillede(url: string): Promise<Buffer> {
    // Runner-tests behøver ikke rigtige billeder — badge testes separat med sharp
    const gemt = this.gemte.get(url);
    if (gemt) return gemt;
    const sharp = (await import("sharp")).default;
    return sharp({
      create: { width: 64, height: 64, channels: 3, background: { r: 180, g: 175, b: 165 } },
    })
      .jpeg()
      .toBuffer();
  }

  async gemBillede(sti: string, indhold: Buffer): Promise<string> {
    this.gemte.set(sti, indhold);
    return sti;
  }
}
