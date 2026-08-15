// Sektionsmarkør i system-stemmen (REDESIGN §2.1): mono-uppercase med
// nummer, fx "01 — SÅDAN VIRKER DET". Nummeret er deterministisk pr. side.
export function SektionsMarkoer({
  nr,
  titel,
  paaMoerk = false,
}: {
  nr: number;
  /** Udelades når en synlig overskrift følger lige efter (undgår dublet) */
  titel?: string;
  paaMoerk?: boolean;
}) {
  return (
    <p
      className={`font-mono text-detalje font-bold uppercase tracking-wide ${
        paaMoerk ? "text-hoer" : "text-tekst/70"
      }`}
    >
      {String(nr).padStart(2, "0")}
      {titel ? ` — ${titel}` : null}
    </p>
  );
}
