"use client";

// S31 · dit faste hjem på billederne. Ejer-ordre 22/8: sælgeren skal IKKE se
// hjemmets navn ("Rørkjær, Esbjerg · lejlighed" siger dem intet og virker
// underligt) — de skal blot kunne skifte til et andet, højst tre gange.
// Stedet er ægte og fast bag kulissen; navnet er et internt id.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

export function HjemVaelger({ tilbage }: { tilbage: number }) {
  const [nuTilbage, setNuTilbage] = useState(tilbage);
  const [travl, setTravl] = useState(false);
  const [skiftet, setSkiftet] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [bekraeft, setBekraeft] = useState(false);
  const copy = da.konto.hjem;

  async function roter() {
    setFejl(null);
    setTravl(true);
    try {
      const svar = await fetch("/api/konto/hjem", { method: "POST" });
      const data = (await svar.json()) as { tilbage?: number; fejl?: string };
      if (!svar.ok) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setNuTilbage(data.tilbage ?? 0);
      setSkiftet(true);
      setBekraeft(false);
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  return (
    <div className="mt-4">
      <p className="text-detalje text-tekst/70">
        {nuTilbage > 0 ? copy.tilbage(nuTilbage) : copy.opbrugt()}
      </p>

      {skiftet ? (
        <p role="status" className="mt-2 max-w-laesbar text-detalje text-gran">
          {copy.skiftet}
        </p>
      ) : null}

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
