"use client";

// Bundle-bygger (KUN Pro, 21/8 nat): vælg 2-4 aktive annoncer på oversigten
// og få én samlet pakke-annonce med skarp pakkepris — klar til copy-paste.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { da } from "@/lib/copy/da";

type BundleItem = { id: string; titel: string; prisTilDkk: number | null };

export function BundleBygger({ items }: { items: BundleItem[] }) {
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [resultat, setResultat] = useState<{
    titel: string;
    beskrivelse: string;
    samletFoerDkk: number;
    bundlePrisDkk: number;
  } | null>(null);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState<string | null>(null);
  const [kopieret, setKopieret] = useState<string | null>(null);
  const copy = da.bundleBygger;

  function skift(id: string) {
    setValgte((f) => {
      const ny = new Set(f);
      if (ny.has(id)) ny.delete(id);
      else if (ny.size < 4) ny.add(id);
      return ny;
    });
  }

  async function byg() {
    setFejl(null);
    setTravl(true);
    setResultat(null);
    try {
      const res = await fetch("/api/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: [...valgte] }),
      });
      const data = (await res.json()) as {
        titel?: string;
        beskrivelse?: string;
        samletFoerDkk?: number;
        bundlePrisDkk?: number;
        fejl?: string;
      };
      if (!res.ok || !data.titel) {
        setFejl(data.fejl ?? da.fejl.generel);
        return;
      }
      setResultat({
        titel: data.titel,
        beskrivelse: data.beskrivelse ?? "",
        samletFoerDkk: data.samletFoerDkk ?? 0,
        bundlePrisDkk: data.bundlePrisDkk ?? 0,
      });
    } catch {
      setFejl(da.fejl.generel);
    } finally {
      setTravl(false);
    }
  }

  async function kopier(tekst: string, hvad: string) {
    try {
      await navigator.clipboard.writeText(tekst);
      setKopieret(hvad);
      setTimeout(() => setKopieret(null), 2000);
    } catch {
      // clipboard blokeret
    }
  }

  if (items.length < 2) {
    return <p className="mt-2 text-detalje text-tekst/70">{copy.forFaa}</p>;
  }

  return (
    <div className="mt-3">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex min-h-touch cursor-pointer items-center gap-3 rounded-bloed border border-kant bg-baggrund px-3 py-2 transition hover:border-koks/50">
              <input
                type="checkbox"
                checked={valgte.has(item.id)}
                onChange={() => skift(item.id)}
                className="h-5 w-5 shrink-0 accent-gran"
              />
              <span className="min-w-0 flex-1 truncate">{item.titel}</span>
              {item.prisTilDkk != null ? (
                <span className="shrink-0 font-mono text-detalje text-tekst/70">
                  ~{item.prisTilDkk} kr.
                </span>
              ) : null}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={() => void byg()} travl={travl} disabled={valgte.size < 2}>
          {copy.knap(valgte.size)}
        </Button>
      </div>
      {fejl ? (
        <p role="alert" className="mt-2 text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
      {resultat ? (
        <div className="mt-4 rounded-bloed border border-kant bg-flade p-4">
          <p className="font-mono text-detalje text-tekst/70">
            {copy.prisLinje(resultat.samletFoerDkk, resultat.bundlePrisDkk)}
          </p>
          <p className="mt-2 font-medium">{resultat.titel}</p>
          <button
            type="button"
            onClick={() => void kopier(resultat.titel, "titel")}
            className="mt-1 inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-3 text-detalje font-medium transition hover:bg-koks hover:text-kalk"
          >
            {kopieret === "titel" ? copy.kopieret : copy.kopierTitel}
          </button>
          <p className="mt-3 max-w-laesbar whitespace-pre-wrap text-detalje">
            {resultat.beskrivelse}
          </p>
          <button
            type="button"
            onClick={() => void kopier(resultat.beskrivelse, "beskrivelse")}
            className="mt-1 inline-flex min-h-touch cursor-pointer items-center rounded-bloed border border-koks px-3 text-detalje font-medium transition hover:bg-koks hover:text-kalk"
          >
            {kopieret === "beskrivelse" ? copy.kopieret : copy.kopierBeskrivelse}
          </button>
        </div>
      ) : null}
    </div>
  );
}
