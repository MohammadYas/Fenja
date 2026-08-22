"use client";

// S31 · dit faste hjem på billederne. Ejer-ordre 22/8: IKKE et gavebord —
// man får ét tildelt og kan rotere det højst tre gange. Derfor ingen liste
// at browse i: kun dit hjem, hvor mange skift du har tilbage, og én knap.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

type HjemVaelgerProps = {
  /** Hjemmets brugervendte navn lige nu */
  navn: string;
  /** Antal rotationer tilbage */
  tilbage: number;
};

export function HjemVaelger({ navn, tilbage }: HjemVaelgerProps) {
  const [nuNavn, setNuNavn] = useState(navn);
  const [nuTilbage, setNuTilbage] = useState(tilbage);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [bekraeft, setBekraeft] = useState(false);
  const copy = da.konto.hjem;

  async function roter() {
    setFejl(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/konto/hjem", { method: "POST" });
      const data = (await svar.json()) as {
        hjem?: { navn: string };
        tilbage?: number;
        fejl?: string;
      };
      if (!svar.ok || !data.hjem) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setNuNavn(data.hjem.navn);
      setNuTilbage(data.tilbage ?? 0);
      setBekraeft(false);
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="rounded-bloed border border-kant bg-baggrund p-4">
        <p className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
          {copy.ditHjem}
        </p>
        <p className="mt-1 font-display text-lead font-semibold">{nuNavn}</p>
        <p className="mt-2 text-detalje text-tekst/70">
          {nuTilbage > 0 ? copy.tilbage(nuTilbage) : copy.opbrugt(0)}
        </p>
      </div>

      {nuTilbage > 0 ? (
        <div className="mt-3">
          {bekraeft ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="max-w-laesbar text-detalje text-tekst/80">
                {copy.bekraeftTekst(nuTilbage)}
              </p>
              <Button onClick={() => void roter()} travl={travl}>
                {copy.bekraeftKnap}
              </Button>
              <button
                type="button"
                onClick={() => setBekraeft(false)}
                className="min-h-touch cursor-pointer text-detalje text-tekst/70 underline underline-offset-4 hover:text-koks"
              >
                {copy.fortryd}
              </button>
            </div>
          ) : (
            <Button variant="sekundaer" onClick={() => setBekraeft(true)}>
              {copy.roterKnap}
            </Button>
          )}
        </div>
      ) : null}

      {fejl ? (
        <p role="alert" className="mt-2 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
    </div>
  );
}
