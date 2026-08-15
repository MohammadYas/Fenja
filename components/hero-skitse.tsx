// Skematiske stregtegninger til hero-rammen: samme trøje som "dit foto"
// (skæv, krøllet, rodet kontekst) og som "renset" (ret, ren flade, blød
// gulvskygge). Egen streg i token-farver — ingen stockbilleder, ingen
// AI-genererede eksempler (§2.1.7). Rammen er stadig en ærligt mærket
// pladsholder, til den udskiftes med ægte app-output efter S12.

const streg = {
  fill: "none",
  stroke: "#212523",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const TROEJE =
  "M60 42l-26 15 10 21 13-8v66h50V70l13 8 10-21-26-15c-5 8-13 11-22 11s-17-3-22-11z";

export function SkitseFoer() {
  return (
    <svg viewBox="0 0 164 170" aria-hidden="true" className="h-full max-h-56 w-auto">
      {/* Bøjlestang og bøjle antyder konteksten: tøj fotograferet hjemme */}
      <path {...streg} strokeWidth={1.4} opacity={0.35} d="M6 18h152" />
      <path {...streg} strokeWidth={1.4} opacity={0.35} d="M120 18c0-6 5-9 9-6" />
      {/* Trøjen: let skæv og krøllet */}
      <g transform="rotate(-7 82 100)" opacity={0.8}>
        <path {...streg} d={TROEJE} />
        {/* Krøller */}
        <path {...streg} strokeWidth={1.4} d="M62 92c6 4 12-2 18 2" />
        <path {...streg} strokeWidth={1.4} d="M74 116c7 3 12-3 20 1" />
        <path {...streg} strokeWidth={1.4} d="M58 130c5 3 9-1 14 1" />
      </g>
      {/* Rodet gulv: en sok og en skygge */}
      <path {...streg} strokeWidth={1.4} opacity={0.4} d="M20 152c8-6 16-2 14 4-8 4-16 1-14-4z" />
      <path {...streg} strokeWidth={1.2} opacity={0.25} d="M36 160c30 6 66 6 96 0" />
    </svg>
  );
}

export function SkitseEfter() {
  return (
    <svg viewBox="0 0 164 170" aria-hidden="true" className="h-full max-h-56 w-auto">
      {/* Samme trøje — ret, glat, på ren flade med blød skygge */}
      <ellipse cx="82" cy="152" rx="46" ry="6" fill="#D8D3C6" />
      <path {...streg} d={TROEJE} />
      {/* Ribkant — detaljen der viser at intet er "forbedret", kun renset */}
      <path {...streg} strokeWidth={1.4} d="M57 128h50" />
      <path {...streg} strokeWidth={1.4} d="M57 134h50" />
    </svg>
  );
}
