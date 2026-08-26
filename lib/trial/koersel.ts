import "server-only";

// Kørslen der binder trial-pipelinen til Supabase: henter det forberedte
// upload, genererer, vandmærker og gemmer — og efterlader ALDRIG en trial i
// evigt "running" (samme bulletproof-princip som items): fejler noget,
// markeres rækken failed med årsag, og den besøgende får en ærlig fejlbesked.

import type { SupabaseClient } from "@supabase/supabase-js";
import { hentTextProvider } from "@/lib/providers";
import { analyserTrialFoto } from "./analyse";
import { vandmaerkOgFormindsk } from "./billede";
import { TRIAL_BUCKET, logTrialEvent } from "./db";
import { hentTrialImageProvider, koerTrialGenerering } from "./pipeline";
import { boerTrialKoere } from "./vaern";

async function hentBytes(klient: SupabaseClient, url: string): Promise<Buffer> {
  // Gemini leverer data-URLs, fal http-URLs, egne stier bor i trial-bucketen
  if (url.startsWith("data:")) {
    const komma = url.indexOf(",");
    if (komma < 0) throw new Error("Ugyldig data-URL fra provider");
    return Buffer.from(url.slice(komma + 1), "base64");
  }
  if (!url.startsWith("http")) {
    const { data, error } = await klient.storage.from(TRIAL_BUCKET).download(url);
    if (error || !data) throw new Error(`Download fejlede for ${url}: ${error?.message}`);
    return Buffer.from(await data.arrayBuffer());
  }
  const svar = await fetch(url);
  if (!svar.ok) throw new Error(`Hentning fejlede (${svar.status}) for ${url}`);
  return Buffer.from(await svar.arrayBuffer());
}

async function gemBytes(
  klient: SupabaseClient,
  sti: string,
  indhold: Buffer,
): Promise<string> {
  // Samme metadata-rens som betalings-pipelinen: provider-filer bærer
  // EXIF/XMP/C2PA, og intet af det må følge med ud (ejer-ordre 22/8)
  let rent = indhold;
  try {
    const { fjernMetadata } = await import("@/lib/pipeline/metadata");
    rent = await fjernMetadata(indhold);
  } catch {
    // sharp kunne ikke læse formatet — gem som modtaget
  }
  const { error } = await klient.storage
    .from(TRIAL_BUCKET)
    .upload(sti, rent, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload fejlede for ${sti}: ${error.message}`);
  return sti;
}

/**
 * Kør trialen mod det gemte upload og persistér udfaldet. Kaldes fra
 * Trigger.dev-jobbet (produktion) eller i processen (lokalt) — aldrig to
 * gange for samme trial (én række, ét forsøg).
 */
export async function koerOgGemTrial(
  klient: SupabaseClient,
  trialId: string,
  originalSti: string,
): Promise<void> {
  try {
    // Kø-dommen (prod-hændelse 26/8): under spidsbelastning kan jobbet ligge
    // i kø hos Trigger.dev — starter det først efter kø-deadlinen, er den
    // besøgende væk, og der bruges IKKE ét provider-kald på det
    const { data: startTjek, error: startTjekFejl } = await klient
      .from("trial_usage")
      .select("status, created_at")
      .eq("id", trialId)
      .maybeSingle();
    // Kan dommen ikke afgøres (net-bump på opslaget), kører vi — dommen er
    // en besparelse, aldrig en grund til at droppe en levedygtig kørsel
    const dom = startTjekFejl
      ? "koer"
      : boerTrialKoere((startTjek as { status: string; created_at: string } | null) ?? null);
    if (dom === "spring-over") return;
    if (dom === "opgivet") {
      await klient
        .from("trial_usage")
        // Estimatet nulstilles: intet blev kørt, og døde forsøg må ikke æde
        // dagens trial-budget for de næste besøgende
        .update({
          status: "failed",
          fejl: "stod for længe i kø — kørslen blev aldrig startet",
          cost_estimat_dkk: 0,
        })
        .eq("id", trialId)
        .eq("status", "running");
      return;
    }

    const original = await hentBytes(klient, originalSti);
    const fotoDataUrl = `data:image/jpeg;base64,${original.toString("base64")}`;

    const leverance = await koerTrialGenerering(
      {
        image: await hentTrialImageProvider(),
        text: await hentTextProvider(),
        analyse: analyserTrialFoto,
      },
      trialId,
      fotoDataUrl,
    );

    const raa = await hentBytes(klient, leverance.billedeUrl);
    const billedeSti = await gemBytes(klient, `${trialId}/resultat.jpg`, raa);
    const vandmaerketSti = await gemBytes(
      klient,
      `${trialId}/vandmaerket.jpg`,
      await vandmaerkOgFormindsk(raa),
    );

    const { error } = await klient
      .from("trial_usage")
      .update({
        status: "completed",
        kategori: leverance.analyse.kategori,
        maerke: leverance.analyse.maerke,
        resultat: leverance.tekst,
        billede_sti: billedeSti,
        vandmaerket_sti: vandmaerketSti,
        cost_estimat_dkk: leverance.costDkk,
      })
      .eq("id", trialId)
      // Kun en stadig-ventende række må fuldføres: har høsteren allerede
      // markeret den failed (den besøgende SÅ en fejl), ville et sent
      // completed låse IP'en i 7 dage for et resultat, ingen har set
      .eq("status", "running");
    if (error) throw new Error(`Kunne ikke gemme trial-resultatet: ${error.message}`);

    await logTrialEvent(klient, "trial_completed", { trialId });
  } catch (fejl) {
    console.error(`Trial ${trialId} fejlede:`, fejl);
    const besked = (fejl instanceof Error ? fejl.message : String(fejl)).slice(0, 500);
    await klient
      .from("trial_usage")
      .update({ status: "failed", fejl: besked })
      .eq("id", trialId)
      .then(({ error }) => {
        if (error) console.error(`Kunne ikke markere trial ${trialId} som fejlet:`, error);
      });
    throw fejl;
  }
}
