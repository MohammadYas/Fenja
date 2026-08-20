"use client";

import { useId, useRef, useState } from "react";
import { da } from "@/lib/copy/da";
import { soegMaerker } from "@/lib/data/maerker";

// Varemærke-felt (ejer-ordre 2026-08-20): den native datalist fyldte hele
// skærmen og så rodet ud. Egen combobox i stedet: man skriver, får en kort
// rangeret liste (soegMaerker — populære mærker før man skriver noget), og
// frit mærkenavn er stadig tilladt.
export function MaerkeVaelger({
  value,
  onChange,
}: {
  value: string;
  onChange: (navn: string) => void;
}) {
  const id = useId();
  const listeId = `${id}-liste`;
  const hjaelpId = `${id}-hjaelp`;
  const [aaben, setAaben] = useState(false);
  const [fremhaevet, setFremhaevet] = useState(-1);
  const rodRef = useRef<HTMLDivElement>(null);

  const forslag = aaben ? soegMaerker(value, "toej", 8) : [];

  const vaelg = (navn: string) => {
    onChange(navn);
    setAaben(false);
    setFremhaevet(-1);
  };

  const paaTast = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!aaben || forslag.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFremhaevet((f) => (f + 1) % forslag.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFremhaevet((f) => (f <= 0 ? forslag.length - 1 : f - 1));
    } else if (e.key === "Enter" && fremhaevet >= 0) {
      e.preventDefault();
      vaelg(forslag[fremhaevet]!);
    } else if (e.key === "Escape") {
      setAaben(false);
      setFremhaevet(-1);
    }
  };

  return (
    <div
      ref={rodRef}
      className="relative flex flex-col gap-1.5"
      onBlur={(e) => {
        // Luk kun når fokus forlader hele feltet (ikke ved klik på et forslag)
        if (!rodRef.current?.contains(e.relatedTarget as Node)) {
          setAaben(false);
          setFremhaevet(-1);
        }
      }}
    >
      <label htmlFor={id} className="text-basis font-medium text-tekst">
        {da.nytItem.maerkeLabel}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={aaben && forslag.length > 0}
        aria-controls={listeId}
        aria-autocomplete="list"
        aria-describedby={hjaelpId}
        autoComplete="off"
        required
        placeholder={da.nytItem.maerkePlaceholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setAaben(true);
          setFremhaevet(-1);
        }}
        onFocus={() => setAaben(true)}
        onKeyDown={paaTast}
        className="min-h-touch rounded-bloed border border-kant bg-baggrund px-3 text-basis text-tekst placeholder:text-tekst/50"
      />
      {aaben && forslag.length > 0 ? (
        <ul
          id={listeId}
          role="listbox"
          className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-bloed border border-kant bg-baggrund shadow-sm"
        >
          {forslag.map((navn, i) => (
            <li key={navn} role="option" aria-selected={i === fremhaevet}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => vaelg(navn)}
                onMouseEnter={() => setFremhaevet(i)}
                className={`min-h-touch w-full px-3 py-2 text-left text-basis ${
                  i === fremhaevet ? "bg-flade text-gran" : "text-tekst"
                }`}
              >
                {navn}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p id={hjaelpId} className="text-detalje text-tekst/70">
        {aaben && value.trim() && forslag.length === 0
          ? da.nytItem.maerkeIngenMatch
          : da.nytItem.maerkeHjaelp}
      </p>
    </div>
  );
}
