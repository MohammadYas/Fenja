"use client";

import Link from "next/link";
import { useState } from "react";
import { vinted } from "@/lib/copy/vinted";

// Drømme-regnestykket (ejer-godkendt plan 20/8): hvor meget kan skabet være
// værd? Ægte tal: medianen af markedshøstens medianpriser, tydeligt mærket
// "regneeksempel — ikke et løfte". Drømmen er muligheden, aldrig et løfte.
export function SkabRegner({
  medianDkk,
  hoestDato,
}: {
  medianDkk: number;
  hoestDato: string;
}) {
  const copy = vinted.skabRegner;
  const [antal, setAntal] = useState(20);
  const vaerdi = antal * medianDkk;

  return (
    <div className="rounded-bloed border border-kant bg-flade p-5 md:p-6">
      <p className="font-display text-titel font-bold">{copy.titel}</p>
      <p className="mt-1 text-detalje text-tekst/70">{copy.lead}</p>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4">
        <label htmlFor="skab-antal" className="text-detalje font-medium">
          {copy.antal(antal)}
        </label>
        <p className="pris-rul font-mono text-hero font-bold text-pris" key={antal}>
          {copy.resultat(vaerdi)}
        </p>
      </div>
      <input
        id="skab-antal"
        type="range"
        min={5}
        max={50}
        step={1}
        value={antal}
        onChange={(e) => setAntal(Number(e.target.value))}
        className="mt-2 w-full accent-gran"
      />
      <p className="mt-2 text-detalje text-tekst/60">
        {copy.note(medianDkk, hoestDato)}
      </p>
      <Link href="/log-ind" className="knap-link mt-4">
        {copy.knap}
      </Link>
    </div>
  );
}
