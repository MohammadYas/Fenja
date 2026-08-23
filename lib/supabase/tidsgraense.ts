// Hård tidsgrænse på ALLE Supabase-rundture (ejer-rapport 23/8 aften: siden
// hang for indloggede brugere — "the edge function timed out" — og forsidens
// ISR-regenerering hang i 30+ sek., mens Supabase svarede fint udefra).
//
// Root cause: et netværkskald der HÆNGER, kaster ikke — så try/catch rundt om
// kaldene hjælper ikke, og middleware/sider ventede for evigt. Med en
// AbortSignal-tidsgrænse fejler kaldet i stedet hurtigt, og alle de
// eksisterende fejlveje (fallbacks, demo-data, redirect til log-ind) tager
// over som designet.
//
// Filen er bevidst uden imports: den skal kunne køre BÅDE i edge-runtime
// (middleware) og i Node (server/jobs).

/** Standard for server-sider og jobs — rigelig til en normal rundtur */
export const SUPABASE_TIDSGRAENSE_MS = 8_000;

/** Middleware kører på HVERT request og skal fejle hurtigere */
export const MIDDLEWARE_TIDSGRAENSE_MS = 5_000;

/**
 * En fetch med indbygget tidsgrænse — gives til Supabase-klienterne via
 * `global.fetch`. Respekterer et eventuelt eksisterende abort-signal fra
 * klienten (begge kan afbryde).
 */
export function fetchMedTidsgraense(
  ms: number = SUPABASE_TIDSGRAENSE_MS,
): typeof fetch {
  return (input, init) => {
    const tidsgraense = AbortSignal.timeout(ms);
    return fetch(input, {
      ...init,
      signal: init?.signal
        ? AbortSignal.any([init.signal, tidsgraense])
        : tidsgraense,
    });
  };
}
