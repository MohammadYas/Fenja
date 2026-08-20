// Anmeldelses-blokken i heroen (EJER-ORDRE 2026-08-20: skal stå på forsiden
// sammen med før/efter-panelet). Tallene er ejer-leverede eksempler på
// Vinted-sælgerprofiler — illustrative, IKKE Selja-kunder (ingen navne,
// ingen påstand om Selja-resultater; jf. "ingen fabrikeret proof",
// overstyret af ejeren for netop denne blok — registreret i STATUS).
import { vinted } from "@/lib/copy/vinted";

type Anmeldelse = {
  score: string;
  antal: number;
  medlemmer: { antal: number; score: string };
  automatiske: { antal: number; score: string };
};

const ANMELDELSER: Anmeldelse[] = [
  { score: "4,3", antal: 152, medlemmer: { antal: 98, score: "4,2" }, automatiske: { antal: 54, score: "4,4" } },
  { score: "4,8", antal: 287, medlemmer: { antal: 185, score: "4,7" }, automatiske: { antal: 102, score: "4,9" } },
  { score: "5,0", antal: 336, medlemmer: { antal: 227, score: "5,0" }, automatiske: { antal: 109, score: "5,0" } },
  { score: "4,6", antal: 214, medlemmer: { antal: 142, score: "4,5" }, automatiske: { antal: 72, score: "4,7" } },
];

function Stjerne() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8L10 1.5z"
      />
    </svg>
  );
}

/** 5 stjerner med brøkdel-fyld: rav ovenpå, dæmpet bund — ingen unicode */
function StjerneRaekke({ score }: { score: string }) {
  const vaerdi = Number(score.replace(",", "."));
  return (
    <span
      className="relative inline-block"
      role="img"
      aria-label={`${score} ud af 5 stjerner`}
    >
      <span className="flex gap-0.5 text-tekst/20">
        {[0, 1, 2, 3, 4].map((i) => (
          <Stjerne key={i} />
        ))}
      </span>
      <span
        className="absolute inset-0 overflow-hidden text-rav"
        style={{ width: `${(vaerdi / 5) * 100}%` }}
        aria-hidden="true"
      >
        <span className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Stjerne key={i} />
          ))}
        </span>
      </span>
    </span>
  );
}

export function Anmeldelser() {
  return (
    <figure className="mt-4">
      <figcaption className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/70">
        {vinted.anmeldelser.label}
      </figcaption>
      <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-bloed border border-kant bg-kant sm:grid-cols-4">
        {ANMELDELSER.map((a) => (
          <div key={a.score + a.antal} className="bg-baggrund p-3">
            <p className="font-display text-titel font-bold leading-none">
              {a.score}
            </p>
            <div className="mt-1.5">
              <StjerneRaekke score={a.score} />
            </div>
            <p className="mt-1 font-mono text-detalje text-tekst/70">
              ({a.antal})
            </p>
            <dl className="mt-2 flex flex-col gap-0.5 text-detalje text-tekst/70">
              <div className="flex justify-between gap-2">
                <dt>{vinted.anmeldelser.medlemmer}</dt>
                <dd className="font-mono">{a.medlemmer.score}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>{vinted.anmeldelser.automatiske}</dt>
                <dd className="font-mono">{a.automatiske.score}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </figure>
  );
}
