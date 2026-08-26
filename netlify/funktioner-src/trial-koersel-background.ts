// Netlify-baggrundsfunktion (26/8): kører trial-genereringen på Netlify selv
// (15 minutters loft), så prøven virker OGSÅ når Trigger.dev-jobbet ikke er
// deployet. Kaldes KUN server-til-server fra lib/trial/start.ts med en
// HMAC-signatur over kroppen (nøglen er SUPABASE_SERVICE_ROLE_KEY, som begge
// sider allerede har) — udefrakommende kan hverken gætte signaturen eller et
// gyldigt trial-id. Kø-dommen i koerOgGemTrial gør genkald ufarlige: en
// allerede afgjort række springes over uden ét provider-kald.
//
// Bundtes med scripts i package.json ("byg:funktioner") til
// netlify/functions/trial-koersel-background.mjs — navnet SKAL ende på
// "-background": det er dét, der giver 202-med-det-samme og det lange loft.

import { createHmac, timingSafeEqual } from "node:crypto";
import { opretServiceKlient } from "@/lib/supabase/service";
import { koerOgGemTrial } from "@/lib/trial/koersel";

function signaturOk(krop: string, signatur: string, noegle: string): boolean {
  const forventet = createHmac("sha256", noegle).update(krop).digest("hex");
  const a = Buffer.from(signatur);
  const b = Buffer.from(forventet);
  return a.length === b.length && timingSafeEqual(a, b);
}

const trialKoerselBackground = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const noegle = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const krop = await req.text();
  const signatur = req.headers.get("x-selja-signatur") ?? "";
  if (!noegle || !signatur || !signaturOk(krop, signatur, noegle)) {
    return new Response(null, { status: 401 });
  }

  let payload: { trialId?: unknown; originalSti?: unknown };
  try {
    payload = JSON.parse(krop) as typeof payload;
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof payload.trialId !== "string" || typeof payload.originalSti !== "string") {
    return new Response(null, { status: 400 });
  }

  // Fejl er allerede logget og persisteret som failed i koerOgGemTrial —
  // svaret her ses aldrig af nogen (baggrundskald)
  await koerOgGemTrial(opretServiceKlient(), payload.trialId, payload.originalSti).catch(
    () => {},
  );
  return new Response(null, { status: 200 });
};

export default trialKoerselBackground;
