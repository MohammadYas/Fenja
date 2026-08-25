import "server-only";

// Claim ved signup (ejer-krav 2): trial-cookien bærer tokenet, og ved første
// login/bekræftelse kopieres resultatet ind som en færdig annonce på kontoen —
// det RENE billede uden vandmærke og hele teksten. Best-effort hele vejen:
// en fejlet claim må ALDRIG spærre et login (samme princip som velkomstmailen).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnnonceTekst } from "@/lib/providers/text";
import { trial } from "@/lib/config";
import { laesTrialToken } from "./cookie";
import { TRIAL_BUCKET, hentTrialViaTokenHash, logTrialEvent } from "./db";
import { trialTokenHash } from "./vaern";

const ITEM_BUCKET = "item-photos";

/** Trial-tokenet fra request-cookies — null uden gyldig signeret cookie */
export async function hentTrialTokenFraCookies(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const krukke = await cookies();
    return laesTrialToken(krukke.get(trial.cookieNavn)?.value);
  } catch {
    return null;
  }
}

async function kopierBillede(
  klient: SupabaseClient,
  fraSti: string,
  tilSti: string,
): Promise<string | null> {
  const { data, error } = await klient.storage.from(TRIAL_BUCKET).download(fraSti);
  if (error || !data) return null;
  const { error: uploadFejl } = await klient.storage
    .from(ITEM_BUCKET)
    .upload(tilSti, Buffer.from(await data.arrayBuffer()), {
      contentType: "image/jpeg",
      upsert: true,
    });
  return uploadFejl ? null : tilSti;
}

/**
 * Claim en completed, uclaimet trial til brugeren. Idempotent i praksis:
 * claimed_by sættes med et filter på "endnu ikke claimet", så to samtidige
 * logins aldrig giver to annoncer.
 */
export async function claimTrial(
  klient: SupabaseClient,
  userId: string,
  token: string | null,
): Promise<void> {
  try {
    if (!token) return;
    const raekke = await hentTrialViaTokenHash(klient, trialTokenHash(token));
    if (!raekke || raekke.status !== "completed" || raekke.claimed_by) return;

    // Reservér claimet FØRST (kapløbs-værn) — kun én vinder rækken
    const { data: reserveret } = await klient
      .from("trial_usage")
      .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
      .eq("id", raekke.id)
      .is("claimed_by", null)
      .select("id")
      .maybeSingle();
    if (!reserveret) return;

    const tekst = raekke.resultat as AnnonceTekst | null;

    // Annoncen på kontoen: samme kolonner som en leveret annonce, så
    // annoncesiden viser den uden specialtilfælde. Ingen kreditter røres —
    // prøven er allerede betalt af trial-budgettet.
    const basisItem = {
      user_id: userId,
      brand: raekke.maerke,
      size: null as string | null,
      condition: null as string | null,
      category: raekke.kategori,
      status: "active",
    };
    let { data: item, error: itemFejl } = await klient
      .from("items")
      .insert({
        ...basisItem,
        titel: tekst?.titel ?? null,
        beskrivelse: tekst?.beskrivelse ?? null,
        soegeord: tekst?.soegeord ?? null,
        pris_fra_dkk: tekst?.prisforslagDkk.fra ?? null,
        pris_til_dkk: tekst?.prisforslagDkk.til ?? null,
        pris_begrundelse: tekst?.prisBegrundelse ?? null,
        leveret_at: new Date().toISOString(),
        visninger: [trial.visningId],
      })
      .select("id")
      .single();
    if (itemFejl && /titel|beskrivelse|soegeord|pris_|leveret_at|visninger|column/i.test(itemFejl.message)) {
      // Ældre databaser uden tekst-kolonnerne (samme fallback som opret-API'et)
      ({ data: item, error: itemFejl } = await klient
        .from("items")
        .insert(basisItem)
        .select("id")
        .single());
    }
    if (itemFejl || !item) return;
    const itemId = item.id as string;

    // Billeder: brugerens eget foto som item-foto, det RENE resultat som
    // succesfuld generering — så annoncesiden viser billedet uden vandmærke
    if (raekke.original_sti) {
      const sti = await kopierBillede(
        klient,
        raekke.original_sti,
        `${userId}/trial-${raekke.id}/original-full.jpg`,
      );
      if (sti) {
        await klient.from("item_photos").insert({
          item_id: itemId,
          role: "full",
          original_url: sti,
        });
      }
    }
    if (raekke.billede_sti) {
      const sti = await kopierBillede(
        klient,
        raekke.billede_sti,
        `${userId}/trial-${raekke.id}/visualisering.jpg`,
      );
      if (sti) {
        // cost 0: omkostningen er allerede logget på trial_usage — den må
        // ikke tælle dobbelt i admin-panelets forbrugstal
        await klient.from("generations").insert({
          item_id: itemId,
          kind: "onmodel",
          status: "succeeded",
          output_url: sti,
          cost_dkk: 0,
          prompt_version: `trial ${trial.visningId}@v1`,
        });
      }
    }

    await logTrialEvent(klient, "trial_to_signup", { trialId: raekke.id });
  } catch (fejl) {
    console.error("Trial-claim fejlede (login fortsætter):", fejl);
  }
}

/** Hele claim-flowet fra et login-endpoint: cookie → claim. Aldrig kast. */
export async function claimTrialVedLogin(
  klient: SupabaseClient,
  userId: string,
): Promise<void> {
  const token = await hentTrialTokenFraCookies();
  await claimTrial(klient, userId, token);
}
