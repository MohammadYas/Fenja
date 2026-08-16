"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

// S31 · vælg det faste hjem visualiseringerne optages i. Tom værdi = lad Selja
// vælge (det deterministiske hjem). Navnene kommer fra da.ts (NFR-12); listen
// af hjem-id'er er den samme kilde som pipelinen bruger, sendt fra siden.
type HjemVaelgerProps = {
  /** Nuværende valg (home_anchor); null/ukendt vises som "Selja vælger" */
  valgt: string | null;
  /** Hjem-id'er i visningsrækkefølge (fra HJEM, serveret af siden) */
  hjemIder: string[];
};

export function HjemVaelger({ valgt, hjemIder }: HjemVaelgerProps) {
  const kendtValg = valgt && hjemIder.includes(valgt) ? valgt : "";
  const [valg, setValg] = useState(kendtValg);
  // Basislinjen er det senest gemte valg — opdateres efter en vellykket gemning,
  // så "Gemt" vises og knappen slår fra, indtil sælgeren ændrer igen.
  const [gemtValg, setGemtValg] = useState(kendtValg);
  const [travl, setTravl] = useState(false);
  const [status, setStatus] = useState<"ren" | "gemt" | "fejl">("ren");

  const aendret = valg !== gemtValg;

  async function gem() {
    setStatus("ren");
    setTravl(true);
    const svar = await fetch("/api/konto/hjem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hjem: valg === "" ? null : valg }),
    });
    setTravl(false);
    if (svar.ok) {
      setGemtValg(valg);
      setStatus("gemt");
    } else {
      setStatus("fejl");
    }
  }

  const muligheder: { vaerdi: string; navn: string; hjaelp?: string }[] = [
    { vaerdi: "", navn: da.konto.hjem.automatisk, hjaelp: da.konto.hjem.automatiskHjaelp },
    ...hjemIder.map((id) => ({ vaerdi: id, navn: da.konto.hjem.navne[id] ?? id })),
  ];

  return (
    <div className="mt-4 flex flex-col gap-3">
      <fieldset className="flex flex-col gap-2" aria-label={da.konto.hjem.titel}>
        {muligheder.map((m) => (
          <label
            key={m.vaerdi || "auto"}
            className="flex min-h-touch cursor-pointer items-center gap-3 text-basis"
          >
            <input
              type="radio"
              name="hjem"
              value={m.vaerdi}
              checked={valg === m.vaerdi}
              onChange={() => {
                setValg(m.vaerdi);
                setStatus("ren");
              }}
              className="h-5 w-5 shrink-0 accent-primaer"
            />
            <span className="flex flex-col">
              <span className="text-tekst">{m.navn}</span>
              {m.hjaelp ? (
                <span className="text-detalje text-tekst/70">{m.hjaelp}</span>
              ) : null}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <Button variant="sekundaer" travl={travl} disabled={!aendret} onClick={gem}>
          {da.konto.hjem.gem}
        </Button>
        {status === "gemt" && !aendret ? (
          <span role="status" className="text-detalje text-primaer">
            {da.konto.hjem.gemt}
          </span>
        ) : null}
        {status === "fejl" ? (
          <span role="alert" className="text-detalje text-fejl">
            {da.konto.hjem.fejl}
          </span>
        ) : null}
      </div>
    </div>
  );
}
