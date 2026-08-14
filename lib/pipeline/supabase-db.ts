import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnnonceTekst } from "@/lib/providers/text";
import type {
  FotoRolle,
  GenereringsSlut,
  ItemTilPipeline,
  PipelineDb,
  PipelineStorage,
} from "./db";

const BUCKET = "item-photos";

// Produktions-implementering med service-klienten (kaldes kun fra jobs/server).
export class SupabasePipelineDb implements PipelineDb {
  constructor(private klient: SupabaseClient) {}

  async hentItem(itemId: string): Promise<ItemTilPipeline> {
    const { data: item, error } = await this.klient
      .from("items")
      .select(
        "id, user_id, brand, size, condition, defects_text, category, purchase_price_dkk, item_photos(id, role, original_url)",
      )
      .eq("id", itemId)
      .single();
    if (error || !item) throw new Error(`Item ${itemId} findes ikke: ${error?.message}`);
    return {
      id: item.id as string,
      userId: item.user_id as string,
      maerke: (item.brand as string | null) ?? "",
      stoerrelse: (item.size as string | null) ?? "",
      stand: (item.condition as string | null) ?? "",
      kategori: (item.category as string | null) ?? "",
      fejlBeskrivelse: item.defects_text as string | null,
      koebsprisDkk: item.purchase_price_dkk as number | null,
      fotos: (
        item.item_photos as { id: string; role: FotoRolle; original_url: string }[]
      ).map((f) => ({ id: f.id, rolle: f.role, url: f.original_url })),
    };
  }

  async startGenerering(
    itemId: string,
    kind: "cleanup" | "onmodel" | "text",
    presetId?: string,
  ): Promise<string> {
    const { data, error } = await this.klient
      .from("generations")
      .insert({ item_id: itemId, kind, status: "running", preset_id: presetId ?? null })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Kunne ikke starte generering: ${error?.message}`);
    return data.id as string;
  }

  async afslutGenerering(genereringsId: string, slut: GenereringsSlut): Promise<void> {
    const { error } = await this.klient
      .from("generations")
      .update({
        status: slut.status,
        cost_dkk: slut.costDkk,
        output_url: slut.outputUrl ?? null,
        fidelity_score: slut.fidelityScore ?? null,
        prompt_version: slut.promptVersion ?? null,
        provider_job_id: slut.providerJobId ?? null,
      })
      .eq("id", genereringsId);
    if (error) throw new Error(`Kunne ikke afslutte generering: ${error.message}`);
  }

  async gemRensetFoto(fotoId: string, cleanedUrl: string): Promise<void> {
    const { error } = await this.klient
      .from("item_photos")
      .update({ cleaned_url: cleanedUrl })
      .eq("id", fotoId);
    if (error) throw new Error(`Kunne ikke gemme renset foto: ${error.message}`);
  }

  async gemAnnonceTekst(itemId: string, tekst: AnnonceTekst): Promise<void> {
    const { error } = await this.klient
      .from("items")
      .update({
        titel: tekst.titel,
        beskrivelse: tekst.beskrivelse,
        soegeord: tekst.soegeord,
        pris_fra_dkk: tekst.prisforslagDkk.fra,
        pris_til_dkk: tekst.prisforslagDkk.til,
        pris_begrundelse: tekst.prisBegrundelse,
      })
      .eq("id", itemId);
    if (error) throw new Error(`Kunne ikke gemme annoncetekst: ${error.message}`);
  }

  async markerLeveret(itemId: string): Promise<void> {
    const { error } = await this.klient
      .from("items")
      .update({ status: "active", leveret_at: new Date().toISOString() })
      .eq("id", itemId);
    if (error) throw new Error(`Kunne ikke markere leveret: ${error.message}`);
  }

  async dagensOmkostningerDkk(): Promise<number> {
    const midnat = new Date();
    midnat.setUTCHours(0, 0, 0, 0);
    const { data, error } = await this.klient
      .from("generations")
      .select("cost_dkk")
      .gte("created_at", midnat.toISOString());
    if (error) throw new Error(`Omkostningsopslag fejlede: ${error.message}`);
    return (data ?? []).reduce(
      (sum, r) => sum + Number((r as { cost_dkk: number | null }).cost_dkk ?? 0),
      0,
    );
  }
}

export class SupabasePipelineStorage implements PipelineStorage {
  constructor(private klient: SupabaseClient) {}

  async hentBillede(url: string): Promise<Buffer> {
    // Egne storage-stier hentes via bucket; eksterne URLs (provider-output) via fetch
    if (!url.startsWith("http")) {
      const { data, error } = await this.klient.storage.from(BUCKET).download(url);
      if (error || !data) throw new Error(`Download fejlede for ${url}: ${error?.message}`);
      return Buffer.from(await data.arrayBuffer());
    }
    const svar = await fetch(url);
    if (!svar.ok) throw new Error(`Hentning fejlede (${svar.status}) for ${url}`);
    return Buffer.from(await svar.arrayBuffer());
  }

  async gemBillede(sti: string, indhold: Buffer): Promise<string> {
    const { error } = await this.klient.storage
      .from(BUCKET)
      .upload(sti, indhold, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`Upload fejlede for ${sti}: ${error.message}`);
    return sti;
  }
}
