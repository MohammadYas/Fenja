// Cloudflare Turnstile (usynlig captcha) verificeret server-side FØR
// generation. Ejer-beslutning 25/8: DENNE release kører uden Cloudflare —
// er der ingen Turnstile-nøgle konfigureret, springes captchaen over, og
// budgetloftet + time-cappen + IP/cookie/fingerprint bærer værnet alene
// (værste fald er bundet af loftet i admin: ~10 trials/time × 0,35 kr.).
// Sættes nøglerne i miljøet (næste update), håndhæves captchaen automatisk
// igen: fail = afvis. Mock-tilstand (NFR-5) springer altid over.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let advaret = false;

export async function verificerTurnstile(
  token: string | null,
  remoteIp: string | null,
  deps: { fetch: typeof fetch } = { fetch },
): Promise<boolean> {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!advaret) {
      advaret = true;
      console.warn(
        "Trial kører UDEN captcha (TURNSTILE_SECRET_KEY er ikke sat) — budgetloft og IP/cookie/fingerprint-værn bærer alene",
      );
    }
    return true;
  }
  if (!token) return false;
  try {
    const krop = new URLSearchParams({ secret, response: token });
    if (remoteIp) krop.set("remoteip", remoteIp);
    const svar = await deps.fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: krop.toString(),
    });
    if (!svar.ok) return false;
    const data = (await svar.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
