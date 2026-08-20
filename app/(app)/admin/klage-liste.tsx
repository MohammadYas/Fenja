"use client";

import { useState } from "react";
import { da } from "@/lib/copy/da";

// Admin-klageliste (ejer-ordre 2026-08-20): åbne klager med godkend/afvis.
// Godkendelse refunderer brugerens kredit (idempotent i ledgeren).
export type KlageRaekke = {
  id: string;
  begrundelse: string;
  oprettet_at: string;
  item_titel: string | null;
};

export function KlageListe({ klager }: { klager: KlageRaekke[] }) {
  const copy = da.admin;
  const [behandlede, setBehandlede] = useState<Record<string, string>>({});
  const [travl, setTravl] = useState<string | null>(null);

  const afgoer = async (klageId: string, afgoerelse: "godkendt" | "afvist") => {
    setTravl(klageId);
    try {
      const svar = await fetch("/api/admin/klager", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ klageId, afgoerelse }),
      });
      if (svar.ok) {
        setBehandlede((f) => ({ ...f, [klageId]: afgoerelse }));
      }
    } finally {
      setTravl(null);
    }
  };

  const aabne = klager.filter((k) => !behandlede[k.id]);
  if (aabne.length === 0) {
    return <p className="mt-2 text-detalje text-tekst/70">{copy.ingenKlager}</p>;
  }

  return (
    <ul className="mt-2 flex flex-col gap-3">
      {aabne.map((klage) => (
        <li key={klage.id} className="rounded-bloed border border-kant p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-medium">{klage.item_titel ?? klage.id}</p>
            <p className="font-mono text-detalje text-tekst/70">
              {klage.oprettet_at.slice(0, 16).replace("T", " ")}
            </p>
          </div>
          <p className="mt-2 max-w-laesbar text-detalje text-tekst/80">
            {klage.begrundelse}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={travl === klage.id}
              onClick={() => afgoer(klage.id, "godkendt")}
              className="knap-link disabled:opacity-50"
            >
              {copy.godkendKnap}
            </button>
            <button
              type="button"
              disabled={travl === klage.id}
              onClick={() => afgoer(klage.id, "afvist")}
              className="min-h-touch text-detalje text-tekst/70 underline underline-offset-4 disabled:opacity-50"
            >
              {copy.afvisKnap}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
