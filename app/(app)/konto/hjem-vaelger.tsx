"use client";

// S31 · dit faste hjem på billederne. Omlagt 22/8 (ejer-ordre "optimer Dit
// hjem på billederne"): der findes nu 105 hjem, så en radioliste er ubrugelig.
// I stedet vises DIT hjem, og man bladrer til et andet — som en shuffle,
// indtil man kan lide stedet. Tom værdi = Selja vælger.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

type HjemVaelgerProps = {
  /** Nuværende valg (home_anchor); null = "Selja vælger" */
  valgt: string | null;
  /** Alle hjem i visningsrækkefølge, sendt fra siden */
  hjem: { id: string; navn: string }[];
  /** Hjemmet sælgeren har lige nu (valgt eller automatisk tildelt) */
  effektivtHjemId: string;
};

export function HjemVaelger({ valgt, hjem, effektivtHjemId }: HjemVaelgerProps) {
  const startIndex = Math.max(
    0,
    hjem.findIndex((h) => h.id === effektivtHjemId),
  );
  const [index, setIndex] = useState(startIndex);
  const [gemtValg, setGemtValg] = useState<string | null>(valgt);
  const [travl, setTravl] = useState(false);
  const [status, setStatus] = useState<"ren" | "gemt" | "fejl">("ren");
  const copy = da.konto.hjem;

  const nuvaerende = hjem[index] ?? hjem[0]!;
  const erAutomatisk = gemtValg === null;
  const aendret = nuvaerende.id !== gemtValg;

  function bladre(retning: 1 | -1) {
    setStatus("ren");
    setIndex((i) => (i + retning + hjem.length) % hjem.length);
  }

  async function gem(vaerdi: string | null) {
    setStatus("ren");
    setTravl(true);
    try {
      const svar = await fetch("/api/konto/hjem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hjem: vaerdi }),
      });
      if (svar.ok) {
        setGemtValg(vaerdi);
        setStatus("gemt");
        if (vaerdi === null) setIndex(startIndex);
      } else {
        setStatus("fejl");
      }
    } catch {
      setStatus("fejl");
    } finally {
      setTravl(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="rounded-bloed border border-kant bg-baggrund p-4">
        <p className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
          {erAutomatisk ? copy.automatisk : copy.ditValg}
        </p>
        <p className="mt-1 font-display text-lead font-semibold">{nuvaerende.navn}</p>
        <p className="mt-1 text-detalje text-tekst/70">
          {copy.tael(index + 1, hjem.length)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => bladre(-1)}
            aria-label={copy.forrige}
            className="inline-flex min-h-touch min-w-touch cursor-pointer items-center justify-center rounded-bloed border border-kant px-4 text-detalje font-medium transition hover:border-koks"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => bladre(1)}
            className="inline-flex min-h-touch cursor-pointer items-center justify-center rounded-bloed border border-kant px-4 text-detalje font-medium transition hover:border-koks"
          >
            {copy.naeste}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={() => void gem(nuvaerende.id)} travl={travl} disabled={!aendret}>
          {copy.gem}
        </Button>
        {!erAutomatisk ? (
          <button
            type="button"
            onClick={() => void gem(null)}
            disabled={travl}
            className="min-h-touch cursor-pointer text-detalje text-tekst/70 underline underline-offset-4 hover:text-koks"
          >
            {copy.tilbageTilAutomatisk}
          </button>
        ) : null}
        {status === "gemt" ? (
          <span role="status" className="text-detalje text-gran">
            {copy.gemt}
          </span>
        ) : null}
        {status === "fejl" ? (
          <span role="alert" className="text-detalje text-fejl">
            {copy.fejl}
          </span>
        ) : null}
      </div>
    </div>
  );
}
