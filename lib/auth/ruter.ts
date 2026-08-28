// Rute-logikken fra middleware som rene funktioner, så den kan testes
// (middleware selv kan ikke unit-testes meningsfuldt i edge-runtime).

/** Stier der kræver login — håndhæves i middleware OG af siderne selv */
export const BESKYTTEDE_PRAEFIKSER = [
  "/oversigt",
  "/items",
  "/nyt-item",
  "/kreditter",
  "/konto",
  "/suppliers",
  "/admin",
] as const;

export function erBeskyttetSti(pathname: string): boolean {
  return BESKYTTEDE_PRAEFIKSER.some((praefiks) => pathname.startsWith(praefiks));
}

/**
 * ?videre=-parameteren efter login: kun interne stier — en åben
 * omdirigering må aldrig kunne smugles ind ("//evil.dk", "https://…").
 */
export function sikkerVidereSti(videre: string | null | undefined): string {
  return videre?.startsWith("/") && !videre.startsWith("//") ? videre : "/oversigt";
}

/** Log ind-siden — den ene side, en ubekræftet cookie aldrig må bortvise fra */
export const LOG_IND_STI = "/log-ind";

export function erLogIndSti(pathname: string): boolean {
  return pathname === LOG_IND_STI;
}

/**
 * Må middlewarens hurtige cookie-genvej (udløbstiden læst af den USIGNEREDE
 * auth-cookie) afgøre requestet?
 *
 * Overalt inde i appen: ja — den sparer en auth-rundtur pr. klik, og siderne
 * verificerer selv. På log ind-siden: ALDRIG. Der er svaret "du er logget
 * ind, gå videre", og er cookien død (session tilbagekaldt, projekt skiftet,
 * konto slettet), sender appen brugeren retur til log ind — en ring, hvor
 * login-siden aldrig kan nås, og hvor eneste udvej er at rydde cookies i
 * hånden. Vejen VÆK fra log ind kræver derfor et rigtigt svar fra Supabase.
 */
export function maaBrugeCookieGenvej(pathname: string): boolean {
  return !erLogIndSti(pathname);
}
