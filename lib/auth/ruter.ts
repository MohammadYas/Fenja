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
