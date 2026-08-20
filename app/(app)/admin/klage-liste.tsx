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
  /** Mærke · kategori · størrelse · stand · farve · label — alt i én linje */
  detaljer: string;
  fejl_beskrivelse: string | null;
  /** Signerede urls: de genererede billeder (nyeste først) — det der bedømmes */
  genererede: string[];
  /** Signerede urls: brugerens egne (rensede) fotos som reference */
  bruger_fotos: string[];
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
          {/* Ejer-ordre 20/8: admin ser ALT relevant — felter, det genererede
              billede (det der bedømmes) og brugerens egne fotos som reference */}
          {klage.detaljer ? (
            <p className="mt-2 font-mono text-detalje text-tekst/70">
              {klage.detaljer}
            </p>
          ) : null}
          {klage.fejl_beskrivelse ? (
            <p className="mt-1 text-detalje text-tekst/70">
              {copy.klageFejlFelt}: {klage.fejl_beskrivelse}
            </p>
          ) : null}
          {klage.genererede.length > 0 ? (
            <div className="mt-3">
              <p className="font-mono text-detalje font-bold text-tekst/70">
                {copy.klageGenererede}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {klage.genererede.map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Genereret billede ${i + 1}`}
                      className="h-36 rounded-stram border border-kant object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-detalje text-tekst/70">{copy.klageIngenBilleder}</p>
          )}
          {klage.bruger_fotos.length > 0 ? (
            <div className="mt-3">
              <p className="font-mono text-detalje font-bold text-tekst/70">
                {copy.klageBrugerFotos}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {klage.bruger_fotos.map((url, i) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Brugerens foto ${i + 1}`}
                      className="h-24 rounded-stram border border-kant object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
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
