// Ét sted til spørgsmålet "hvem er brugeren?" — og til den skelnen, der er
// hele pointen: et RIGTIGT nej fra Supabase (sessionen er væk/ugyldig) er
// ikke det samme som et kald, der ALDRIG NÅEDE FREM (timeout, netværk, 5xx).
//
// Baggrund (ejer-rapport: "kan ikke logge ind"): middleware har siden
// timeout-fixet 23/8 skelnet korrekt og fejlet ÅBENT, mens siderne
// behandlede begge slags som "logget ud" og sendte brugeren på login-væggen.
// Kombineret med middlewarens auto-login fra log ind-siden gav det en RING:
// /oversigt sagde "log ind", og log ind sagde "du er jo logget ind" — og
// browseren gav op med for mange omdirigeringer. Login-siden var dermed
// ikke til at nå, uden at rydde cookies i hånden.
//
// Reglen der gælder alle steder: kun et rigtigt nej må logge nogen ud.

type AuthSvar = {
  data: { user: { id: string; email?: string } | null } | null;
  error?: { name?: string; status?: number; message?: string } | null;
};

type AuthKlient = { auth: { getUser: () => Promise<AuthSvar> } };

export type BrugerTilstand = {
  bruger: { id: string; email?: string } | null;
  /** Supabase svarede et rigtigt nej — sessionen er væk eller ugyldig */
  afvist: boolean;
  /** Kaldet nåede aldrig frem — sig ALDRIG "logget ud" på det grundlag */
  fejlede: boolean;
};

const NETVAERKSORD = /fetch|network|timeout|abort|socket|ecconn|econn/i;

/**
 * Fejlede selve kaldet (i modsætning til: Supabase afviste sessionen)?
 * supabase-js pakker netværksfejl i AuthRetryableFetchError (status 0),
 * mens en død session kommer som AuthApiError/AuthSessionMissingError med
 * en rigtig 4xx-status.
 */
export function kaldetFejlede(fejl: unknown): boolean {
  if (!fejl || typeof fejl !== "object") return false;
  const { name, status, message } = fejl as {
    name?: string;
    status?: number;
    message?: string;
  };
  if (name === "AuthRetryableFetchError") return true;
  if (typeof status === "number") return status === 0 || status >= 500;
  return NETVAERKSORD.test(name ?? "") || NETVAERKSORD.test(message ?? "");
}

/** Henter brugeren og fortæller ÆRLIGT, hvorfor der ingen er. */
export async function hentBrugerTilstand(
  supabase: AuthKlient,
): Promise<BrugerTilstand> {
  try {
    const { data, error } = await supabase.auth.getUser();
    const bruger = data?.user ?? null;
    if (bruger) return { bruger, afvist: false, fejlede: false };
    if (kaldetFejlede(error)) return { bruger: null, afvist: false, fejlede: true };
    return { bruger: null, afvist: true, fejlede: false };
  } catch {
    // Kastet fejl (fx AbortError fra tidsgrænsen) = intet svar, ikke et nej
    return { bruger: null, afvist: false, fejlede: true };
  }
}
