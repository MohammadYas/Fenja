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
        "id, user_id, brand, size, condition, defects_text, category, purchase_price_dkk, item_photos(id, role, original_url, cleaned_url), profiles(home_anchor)",
      )
      .eq("id", itemId)
      .single();
    if (error || !item) throw new Error(`Item ${itemId} findes ikke: ${error?.message}`);
    // Profilen embeddes to-one via items.user_id → profiles.id; nogle PostgREST-
    // versioner giver et array, andre et objekt — håndtér begge (S31).
    const profil = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    return {
      id: item.id as string,
      userId: item.user_id as string,
      maerke: (item.brand as string | null) ?? "",
      stoerrelse: (item.size as string | null) ?? "",
      stand: (item.condition as string | null) ?? "",
      kategori: (item.category as string | null) ?? "",
      fejlBeskrivelse: item.defects_text as string | null,
      koebsprisDkk: item.purchase_price_dkk as number | null,
      ...(await this.hentSkrevetLabel(itemId)),
      hjemAnker: (profil as { home_anchor: string | null } | null)?.home_anchor ?? null,
      fotos: await Promise.all(
        (
          item.item_photos as {
            id: string;
            role: FotoRolle;
            original_url: string;
            cleaned_url: string | null;
          }[]
        ).map(async (f) => ({
          id: f.id,
          rolle: f.role,
          // Providere skal bruge en URL de kan hente — storage-stier signeres
          url: await this.tilUrl(f.original_url),
          rensetUrl: f.cleaned_url ? await this.tilUrl(f.cleaned_url) : null,
        })),
      ),
    };
  }

  /** label_text/color kom til 20/8 (migration 20260820020000) — hentes
   *  fejltolerant i egen forespørgsel, så pipelinen også kører mod en
   *  database, hvor migrationen endnu ikke er kørt. */
  private async hentSkrevetLabel(
    itemId: string,
  ): Promise<{ labelTekst: string | null; farve: string | null }> {
    const { data, error } = await this.klient
      .from("items")
      .select("label_text, color")
      .eq("id", itemId)
      .maybeSingle();
    if (error || !data) return { labelTekst: null, farve: null };
    return {
      labelTekst: (data.label_text as string | null) ?? null,
      farve: (data.color as string | null) ?? null,
    };
  }

  private async tilUrl(stiEllerUrl: string): Promise<string> {
    if (stiEllerUrl.startsWith("http")) return stiEllerUrl;
    const { data, error } = await this.klient.storage
      .from(BUCKET)
      .createSignedUrl(stiEllerUrl, 3600);
    if (error || !data) {
      throw new Error(`Signering fejlede for ${stiEllerUrl}: ${error?.message}`);
    }
    return data.signedUrl;
  }

  async startGenerering(
    itemId: string,
    kind: "cleanup" | "onmodel" | "text",
    _presetId?: string,
  ): Promise<string> {
    const { data, error } = await this.klient
      .from("generations")
      // preset_id-kolonnen er uuid (init-migrationen) men vores preset-id'er
      // er tekst ("lys-minimalisme") — skrivningen væltede HVER onmodel-
      // generering (fundet 20/8: "invalid input syntax for type uuid").
      // Presettet står allerede i prompt_version, og kolonnen læses aldrig.
      .insert({ item_id: itemId, kind, status: "running" })
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

  async antalGenereringer(itemId: string, kind: "onmodel" | "text"): Promise<number> {
    const { count, error } = await this.klient
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("item_id", itemId)
      .eq("kind", kind);
    if (error) throw new Error(error.message);
    return count ?? 0;
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
    // Gemini leverer billeder som data-URLs — decode direkte. (Roden til
    // "Download fejlede for data:image/…" 20/8: data-URL'en blev behandlet
    // som storage-sti, og hele pipelinen væltede.)
    if (url.startsWith("data:")) {
      const komma = url.indexOf(",");
      if (komma < 0) throw new Error("Ugyldig data-URL fra provider");
      return Buffer.from(url.slice(komma + 1), "base64");
    }
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
