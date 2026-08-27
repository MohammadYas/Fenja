import { NextResponse, type NextRequest } from "next/server";
import { hentTrialIndstillinger } from "@/lib/admin/trial-indstillinger";
import { trial } from "@/lib/config";
import { da } from "@/lib/copy/da";
import { forMangeKald, klientNoegle, tjekRateLimit } from "@/lib/sikkerhed/ratelimit";
import { opretServiceKlient } from "@/lib/supabase/service";
import { aflaesBilledType, forberedInputBillede } from "@/lib/trial/billede";
import {
  laesTrialToken,
  signerTrialToken,
  trialCookieOpsaetning,
} from "@/lib/trial/cookie";
import {
  SupabaseTrialVaernDb,
  TRIAL_BUCKET,
  hoestHaengendeTrials,
  logTrialEvent,
  opretTrialRaekke,
} from "@/lib/trial/db";
import { laesTrialFelter } from "@/lib/trial/form";
import { startTrial } from "@/lib/trial/start";
import { verificerTurnstile } from "@/lib/trial/turnstile";
import {
  tjekTrialVaern,
  trialFingerprintHash,
  trialIpHash,
  trialTokenHash,
} from "@/lib/trial/vaern";

// Forventningen matcher trialens hårde 60-sekunders loft — IKKE den betalte
// pipelines 2-3 minutter pr. billede (flash-modellen er markant hurtigere).
// (Ingen export: Next tillader kun handler-exports fra route-filer.)
const TRIAL_FORVENTET_SEKUNDER = Math.round(trial.timeoutMs / 1000);

// Gratis prøve uden konto (ejer-ordre 25/8). Rækkefølgen er ejer-krav:
// admin-togglet tjekkes FØRST (før captcha og værn, læst fra databasen — så
// et "luk trialen nu" virker uden deploy), derefter billige lokale tjeks,
// captcha, og til sidst værnene. AI-API'et kaldes ALDRIG for en blokeret
// anmodning. Endpointet tager kun imod fotoet — model/opløsning/visning er
// hårdkodet server-side (lib/config.ts trial.*) og kan ikke ændres herfra.
export async function POST(request: NextRequest) {
  const service = opretServiceKlient();
  const blokeret = (
    aarsag: "lukket" | "budget" | "time" | "cookie" | "captcha",
    besked: string,
    status: number,
  ) => {
    void logTrialEvent(service, "trial_blocked", { aarsag });
    return NextResponse.json({ fejl: besked, aarsag }, { status });
  };

  // 1) Admin-toggle + fejlsikret lukket ved DB-fejl (ejer-krav 3a)
  const indstillinger = await hentTrialIndstillinger();
  if (!indstillinger || !indstillinger.aktiv) {
    return blokeret("lukket", da.prov.fejlLukket, 403);
  }

  // 2) Billig brandmur før Turnstiles netværkskald — spam på selve ruten
  const graense = await tjekRateLimit("prov", klientNoegle(request), 15, 3600);
  if (!graense.tilladt) return forMangeKald(graense.nulstillerOm);

  // 3) Kun de tre kendte felter læses — alt andet i payloaden kasseres
  let felter;
  try {
    felter = laesTrialFelter(await request.formData());
  } catch {
    return NextResponse.json({ fejl: da.prov.fejlUgyldigFil }, { status: 400 });
  }
  if (!felter.foto) {
    return NextResponse.json({ fejl: da.prov.fejlIngenFil }, { status: 400 });
  }
  if (felter.foto.size > trial.maksUploadBytes) {
    return NextResponse.json({ fejl: da.prov.fejlForStor }, { status: 400 });
  }
  const raaBytes = Buffer.from(await felter.foto.arrayBuffer());
  // Magic bytes, aldrig extension: filnavnet er klientens påstand, ikke bevis
  if (!aflaesBilledType(raaBytes)) {
    return NextResponse.json({ fejl: da.prov.fejlUgyldigFil }, { status: 400 });
  }
  let inputBillede: Buffer;
  try {
    inputBillede = await forberedInputBillede(raaBytes);
  } catch {
    // Typisk HEIC på en build uden HEIF-dekoder — ærlig besked frem for spild
    return NextResponse.json({ fejl: da.prov.fejlKunneIkkeLaeses }, { status: 400 });
  }

  // 4) Captcha — verificeret server-side, fail = afvis (ejer-krav 4)
  const ipHash = trialIpHash(request);
  if (!(await verificerTurnstile(felter.captchaToken, null))) {
    return blokeret("captcha", da.prov.fejlCaptcha, 403);
  }

  // 5) Budget/time/cookie/IP/fingerprint — alle server-side (ejer-krav 3)
  // Fingerprintet GEMMES på rækken (misbrugsanalyse) men blokerer ikke —
  // på iOS deler alle telefoner af samme model hash (kodereview 25/8)
  const cookieToken = laesTrialToken(request.cookies.get(trial.cookieNavn)?.value);
  const svar = await tjekTrialVaern(new SupabaseTrialVaernDb(service), {
    ipHash,
    cookieToken,
  });
  if (!svar.tilladt) {
    const besked =
      svar.aarsag === "budget" || svar.aarsag === "time"
        ? da.prov.fejlBudget
        : svar.aarsag === "lukket"
          ? da.prov.fejlLukket
          : da.prov.fejlAlleredeBrugt;
    return blokeret(svar.aarsag, besked, svar.aarsag === "lukket" ? 403 : 429);
  }

  // 6) Alt er godkendt. Høst først de rækker, en tidligere besøgende
  // efterlod i "running" ved at lukke fanen — høsten i status-ruten kræver
  // en poller, og uden én stod rækkerne der for evigt (dataanalyse 27/8).
  // Best-effort: en fejlet høst må aldrig koste den besøgende sin prøve.
  await hoestHaengendeTrials(service);

  // Opret rækken, gem det forberedte foto og start kørslen
  const token = crypto.randomUUID();
  let trialId: string;
  try {
    trialId = await opretTrialRaekke(service, {
      tokenHash: trialTokenHash(token),
      ipHash,
      fingerprintHash: felter.skaerm ? trialFingerprintHash(request, felter.skaerm) : null,
    });
  } catch {
    // Migrationen mangler eller databasen er nede — fejlsikret lukket
    return blokeret("lukket", da.prov.fejlLukket, 503);
  }
  void logTrialEvent(service, "trial_started", { trialId });

  const originalSti = `${trialId}/original.jpg`;
  const { error: uploadFejl } = await service.storage
    .from(TRIAL_BUCKET)
    .upload(originalSti, inputBillede, { contentType: "image/jpeg", upsert: true });
  if (uploadFejl) {
    await service
      .from("trial_usage")
      .update({ status: "failed", fejl: `upload: ${uploadFejl.message}`.slice(0, 500) })
      .eq("id", trialId);
    return NextResponse.json({ fejl: da.prov.fejlGenerering }, { status: 500 });
  }
  await service.from("trial_usage").update({ original_sti: originalSti }).eq("id", trialId);

  // Prod-hændelse 26/8: kan kørslen ikke startes (ingen motor tog den),
  // skal den besøgende have en ØJEBLIKKELIG, ærlig fejl — aldrig minutters
  // falsk fremdrift mod en række, intet job nogensinde samler op
  const motor = await startTrial(trialId, originalSti);
  if (!motor) {
    await service
      .from("trial_usage")
      // Estimatet nulstilles: intet provider-kald er sket, og døde forsøg må
      // ikke æde dagens trial-budget for de næste besøgende
      .update({
        status: "failed",
        fejl: "kørslen kunne ikke startes (Trigger.dev-jobbet utilgængeligt)",
        cost_estimat_dkk: 0,
      })
      .eq("id", trialId);
    return NextResponse.json({ fejl: da.prov.fejlKunneIkkeStarte }, { status: 503 });
  }

  // Cookien sættes allerede nu: den bærer claim-tokenet, og værnet blokerer
  // først, når trialen står COMPLETED — en fejlet prøve låser ikke browseren
  const respons = NextResponse.json({
    token,
    forventetSekunder: TRIAL_FORVENTET_SEKUNDER,
    // Fejlsøgnings-markør (26/8): hvilken motor tog kørslen — ufarlig at
    // vise, og uvurderlig når produktionen skal aflæses udefra
    motor,
  });
  const { name, ...opsaetning } = trialCookieOpsaetning();
  respons.cookies.set(name, signerTrialToken(token), opsaetning);
  return respons;
}
