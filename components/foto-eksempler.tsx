// Eksempel-illustrationer pr. fotorolle (B-1): enkle egne stregtegninger i
// token-farver — ingen stockbilleder, ingen AI-genererede eksempler (§2.1.7).
// Ejer-ordre 2026-08-20: ikonet følger tøjdelen valgt i wizard-trin 1 —
// jeans skal ikke vises som en trøje.

const faelles = {
  fill: "none",
  stroke: "#212523",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type Snit =
  | "troeje"
  | "jakke"
  | "bukser"
  | "shorts"
  | "kjole"
  | "nederdel"
  | "taske"
  | "andet";

// Tøjdel (da.nytItem.dele) → silhuet. Fritekst under "Andet" rammer bøjlen.
function snitFor(kategori?: string): Snit {
  const k = (kategori ?? "").toLowerCase();
  if (k.includes("jeans") || k.includes("bukser")) return "bukser";
  if (k.includes("shorts")) return "shorts";
  if (k.includes("kjole")) return "kjole";
  if (k.includes("nederdel")) return "nederdel";
  if (k.includes("taske")) return "taske";
  if (k.includes("jakke") || k.includes("frakke")) return "jakke";
  if (
    k.includes("t-shirt") ||
    k.includes("strik") ||
    k.includes("hoodie") ||
    k.includes("sweatshirt") ||
    k.includes("skjorte")
  )
    return "troeje";
  return "andet";
}

const TROEJE = "M24 14l-10 6 4 8 5-3v25h18V25l5 3 4-8-10-6c-2 3-5 4-8 4s-6-1-8-4z";

// Silhuetten pr. snit + en lille bagside-detalje (søm/lomme), så de to
// rollekort stadig kan skelnes fra hinanden.
const SILHUETTER: Record<Snit, { helhed: string[]; bagside: string }> = {
  troeje: { helhed: [TROEJE], bagside: "M26 18h12" },
  jakke: { helhed: [TROEJE, "M32 24v26"], bagside: "M26 18h12" },
  bukser: {
    helhed: ["M23 14h18v8l3 28h-9l-3-20-3 20h-9l3-28z", "M23 22h18"],
    bagside: "M28 27h8",
  },
  shorts: {
    helhed: ["M22 18h20v6l4 16h-11l-3-10-3 10h-11l4-16z", "M22 24h20"],
    bagside: "M28 29h8",
  },
  kjole: {
    helhed: ["M25 16l7 5 7-5 3 8-4 3 7 21H19l7-21-4-3z"],
    bagside: "M29 22h6",
  },
  nederdel: {
    helhed: ["M24 20h16l6 26H18z", "M26 26l-2 14", "M38 26l2 14"],
    bagside: "M28 23h8",
  },
  taske: {
    helhed: ["M20 28h24v17a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z", "M26 28c0-9 12-9 12 0"],
    bagside: "M27 36h10",
  },
  andet: {
    helhed: ["M32 26v-3c3-1 3-6 0-6-2 0-4 1-4 4", "M32 26L50 42H14z"],
    bagside: "M26 38h12",
  },
};

function Silhuet({
  kategori,
  bagside,
}: {
  kategori?: string;
  bagside?: boolean;
}) {
  const snit = SILHUETTER[snitFor(kategori)];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
      {snit.helhed.map((d) => (
        <path key={d} {...faelles} d={d} />
      ))}
      {bagside ? <path {...faelles} d={snit.bagside} /> : null}
    </svg>
  );
}

export function EksempelHelhed({ kategori }: { kategori?: string }) {
  return <Silhuet kategori={kategori} />;
}

export function EksempelBagside({ kategori }: { kategori?: string }) {
  return <Silhuet kategori={kategori} bagside />;
}

export function EksempelLabel() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
      <rect {...faelles} x="20" y="16" width="24" height="32" rx="2" />
      <path {...faelles} d="M26 24h12M26 30h12M26 36h8" />
    </svg>
  );
}

export function EksempelFejl() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
      <circle {...faelles} cx="32" cy="32" r="16" />
      <path {...faelles} stroke="#C97F1B" d="M27 30l4 5 6-8" />
    </svg>
  );
}
