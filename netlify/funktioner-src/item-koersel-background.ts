// Netlify-baggrundsfunktion (30/8): kører item-pipelinen og regenereringer
// på Netlify selv (15 minutters loft). Den findes, fordi Trigger.dev-bundtet
// kun opdateres af `npx trigger.dev deploy` — et deploy der aldrig er kørt.
// Produktionen kørte derfor otte dage gammel kode, mens hvert Netlify-deploy
// så grønt ud. Denne vej opdateres af et helt almindeligt deploy.
//
// Kaldes KUN server-til-server fra lib/pipeline/start.ts med en HMAC-signatur
// over kroppen (nøglen er SUPABASE_SERVICE_ROLE_KEY, som begge sider allerede
// har) — udefrakommende kan hverken gætte signaturen eller et gyldigt item-id.
// Genkald er ufarlige: ledger og storage-stier er idempotente (E-4).
//
// Bundtes med "byg:funktioner" til netlify/functions/item-koersel-background.mjs
// — navnet SKAL ende på "-background": det er dét, der giver 202-med-det-samme
// og det lange loft.

import { createHmac, timingSafeEqual } from "node:crypto";
import { koerItemSikkert, koerRegenSikkert } from "@/lib/pipeline/koersel";
import type { RegenDel } from "@/lib/pipeline/run";

function signaturOk(krop: string, signatur: string, noegle: string): boolean {
  const forventet = createHmac("sha256", noegle).update(krop).digest("hex");
  const a = Buffer.from(signatur);
  const b = Buffer.from(forventet);
  return a.length === b.length && timingSafeEqual(a, b);
}

const REGEN_DELE: readonly string[] = ["visualisering", "tekst"];

const itemKoerselBackground = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const krop = await req.text();
  const signatur = req.headers.get("x-selja-signatur") ?? "";
  if (!noegle || !signatur || !signaturOk(krop, signatur, noegle)) {
    return new Response(null, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(krop) as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof payload.itemId !== "string") return new Response(null, { status: 400 });
  const itemId = payload.itemId;
  const presetId = typeof payload.presetId === "string" ? payload.presetId : undefined;

  // Fejl er allerede logget og persisteret i koer*Sikkert — svaret her ses
  // aldrig af nogen (baggrundskald)
  if (payload.slags === "regen") {
    if (typeof payload.requestId !== "string") return new Response(null, { status: 400 });
    if (typeof payload.del !== "string" || !REGEN_DELE.includes(payload.del)) {
      return new Response(null, { status: 400 });
    }
    await koerRegenSikkert(itemId, payload.del as RegenDel, payload.requestId, presetId);
    return new Response(null, { status: 200 });
  }

  if (payload.slags !== "pipeline") return new Response(null, { status: 400 });
  const visninger = Array.isArray(payload.visninger)
    ? payload.visninger.filter((v): v is string => typeof v === "string")
    : undefined;
  await koerItemSikkert(itemId, presetId, visninger);
  return new Response(null, { status: 200 });
};

export default itemKoerselBackground;
