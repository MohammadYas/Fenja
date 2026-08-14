"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { da } from "@/lib/copy/da";

// Slet konto (A-4): destruktiv handling — kræver skriftlig bekræftelse,
// tydeligt adskilt fra resten af siden.
export function SletKonto() {
  const [aaben, setAaben] = useState(false);
  const [bekraeftelse, setBekraeftelse] = useState("");
  const [fejl, setFejl] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);

  async function slet() {
    setFejl(null);
    setTravl(true);
    const svar = await fetch("/api/konto/slet", { method: "POST" });
    setTravl(false);
    if (!svar.ok) {
      setFejl(da.konto.sletFejl);
      return;
    }
    window.location.href = "/";
  }

  return (
    <section className="mt-8" aria-label={da.konto.sletKonto}>
      <p className="max-w-laesbar text-detalje text-tekst/70">
        {da.konto.sletForklaring}
      </p>
      {!aaben ? (
        <Button variant="sekundaer" className="mt-3" onClick={() => setAaben(true)}>
          {da.konto.sletKonto}
        </Button>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <Field
            label={da.konto.sletBekraeft}
            value={bekraeftelse}
            onChange={(e) => setBekraeftelse(e.target.value)}
            autoComplete="off"
          />
          {fejl ? (
            <p role="alert" className="text-detalje text-fejl">
              {fejl}
            </p>
          ) : null}
          <Button
            variant="fejl"
            travl={travl}
            disabled={bekraeftelse !== da.konto.sletBekraeftOrd}
            onClick={slet}
          >
            {da.konto.sletEndeligt}
          </Button>
        </div>
      )}
    </section>
  );
}
