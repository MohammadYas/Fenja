// Cloudflare Turnstile (usynlig captcha) verificeret server-side FØR
// generation. Fail = afvis — også når hemmeligheden mangler i produktion
// (fejlsikret lukket: en fejlkonfigureret captcha må aldrig åbne trialen).
// Mock-tilstand (NFR-5) springer over, så alt kan køre lokalt uden nøgler.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verificerTurnstile(
  token: string | null,
  remoteIp: string | null,
  deps: { fetch: typeof fetch } = { fetch },
): Promise<boolean> {
  if (process.env.MOCK_PROVIDERS === "1") return true;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;
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
