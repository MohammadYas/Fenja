// Eksempel-illustrationer pr. fotorolle (B-1): enkle egne stregtegninger i
// token-farver — ingen stockbilleder, ingen AI-genererede eksempler (§2.1.7).

const faelles = {
  fill: "none",
  stroke: "#212523",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function EksempelHelhed() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
      <path
        {...faelles}
        d="M24 14l-10 6 4 8 5-3v25h18V25l5 3 4-8-10-6c-2 3-5 4-8 4s-6-1-8-4z"
      />
    </svg>
  );
}

export function EksempelBagside() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
      <path
        {...faelles}
        d="M24 14l-10 6 4 8 5-3v25h18V25l5 3 4-8-10-6c-2 3-5 4-8 4s-6-1-8-4z"
      />
      <path {...faelles} d="M26 18h12" />
    </svg>
  );
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
