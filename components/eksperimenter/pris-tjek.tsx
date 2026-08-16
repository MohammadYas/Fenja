"use client";

import { useState } from "react";
import { da } from "@/lib/copy/da";

// Interaktiv pristjekker (eksperiment prisTjek): vælg en søgning fra
// markedshøsten og se interval + median. Tallet ruller ind ved skift
// (pris-rul, samme bevægelsessprog som md./år-skiftet på /priser).
export type PrisTjekPunkt = {
  soegetekst: string;
  antal: number;
  p25Dkk: number;
  medianDkk: number;
  p75Dkk: number;
};

export function PrisTjek({
  punkter,
  hoestDato,
  className = "",
}: {
  punkter: PrisTjekPunkt[];
  /** Formateret dansk dato for høsten */
  hoestDato: string;
  className?: string;
}) {
  const [valgtIndex, setValgtIndex] = useState(0);
  const valgt = punkter[valgtIndex];
  const copy = da.eksperimenter;
  if (!valgt) return null;

  return (
    <div className={`rounded-bloed border border-kant bg-flade p-5 ${className}`}>
      <p className="font-display text-titel font-bold">{copy.prisTjekTitel}</p>
      <p className="mt-1 text-detalje text-tekst/70">{copy.prisTjekLead}</p>
      <label className="mt-4 block">
        <span className="block text-detalje font-medium">{copy.prisTjekLabel}</span>
        <select
          value={valgtIndex}
          onChange={(e) => setValgtIndex(Number(e.target.value))}
          className="mt-1 w-full cursor-pointer rounded-bloed border border-kant bg-baggrund px-3 py-2.5 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-koks"
        >
          {punkter.map((punkt, i) => (
            <option key={punkt.soegetekst} value={i}>
              {punkt.soegetekst}
            </option>
          ))}
        </select>
      </label>
      {/* key-skiftet genstarter pris-rul, så intervallet ruller ind */}
      <div key={valgt.soegetekst} className="pris-rul mt-4">
        <p className="font-mono text-hero font-bold leading-none">
          {copy.prisTjekInterval(valgt.p25Dkk, valgt.p75Dkk)}
        </p>
        <p className="mt-1 font-mono text-detalje text-tekst/70">
          {copy.median(valgt.medianDkk)}
        </p>
      </div>
      <p className="mt-3 text-detalje text-tekst/70">
        {copy.prisTjekKilde(valgt.antal, hoestDato)}
      </p>
    </div>
  );
}
