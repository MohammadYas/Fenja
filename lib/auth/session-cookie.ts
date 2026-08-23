// Læser Supabase-sessionens udløbstid DIREKTE af auth-cookien, uden netkald
// (ejer-rapport 23/8 aften: "den loader så langsomt" — hvert klik fra en
// indlogget bruger betalte en auth-rundtur i middleware, og når
// Netlify→Supabase-forbindelsen hakker, blev hvert klik til sekunders
// venten). Middlewarens OPGAVE er kun at forny sessionen før udløb — er der
// længe til udløb, er der intet at forny, og netkaldet kan springes over.
//
// SIKKERHED: cookien er IKKE verificeret her (ingen signatur-tjek), og den
// bruges derfor ALDRIG til autorisation — kun til at afgøre "skal vi forny
// nu?". Alle sider verificerer selv brugeren med et rigtigt getUser-kald.
// En forfalsket cookie kan højst springe en fornyelse over og nå frem til
// en side, der afviser den.
//
// Cookie-formatet fra @supabase/ssr: `sb-<ref>-auth-token` med JSON, evt.
// "base64-"-prefikset og evt. delt i bidder (`.0`, `.1`, …) når værdien er
// for lang til én cookie. Edge-sikker: ingen imports.

type Cookie = { name: string; value: string };

const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

/** Sekunder til sessionens udløb, eller null når det ikke kan afgøres */
export function sekunderTilSessionUdloeb(
  cookies: readonly Cookie[],
  nuMs: number = Date.now(),
): number | null {
  try {
    const bidder = cookies
      .filter((c) => AUTH_COOKIE.test(c.name))
      .sort((a, b) => {
        // "…token" før "…token.0"; bidder i numerisk orden
        const na = Number(a.name.split(".").pop());
        const nb = Number(b.name.split(".").pop());
        return (Number.isNaN(na) ? -1 : na) - (Number.isNaN(nb) ? -1 : nb);
      })
      .map((c) => c.value);
    if (bidder.length === 0) return null;

    let raa = bidder.join("");
    if (raa.startsWith("base64-")) {
      raa = atob(raa.slice("base64-".length));
    }
    const session = JSON.parse(raa) as { expires_at?: number };
    if (typeof session.expires_at !== "number") return null;
    return Math.floor(session.expires_at - nuMs / 1000);
  } catch {
    // Ukendt format → null, og kalderen tager den normale netvej
    return null;
  }
}

/**
 * Kan fornyelsen springes over? Marginen sikrer at vi altid fornyer i god
 * tid FØR udløb, så brugeren aldrig når at stå med en død session.
 */
export function sessionErFrisk(
  cookies: readonly Cookie[],
  margenSek = 120,
  nuMs: number = Date.now(),
): boolean {
  const om = sekunderTilSessionUdloeb(cookies, nuMs);
  return om !== null && om > margenSek;
}
