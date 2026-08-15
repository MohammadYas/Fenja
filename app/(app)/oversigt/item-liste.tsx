"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { da } from "@/lib/copy/da";
import { MarkerSolgt } from "./marker-solgt";

type Status = "draft" | "active" | "sold";

export type ItemTilListe = {
  id: string;
  titel: string;
  status: Status;
  soldPrisDkk: number | null;
};

const STATUSSER: Status[] = ["draft", "active", "sold"];

// Statusfilter (U4): chips over listen — mono-lapper som badges, valgt = koks.
// Filtrering sker i browseren; listen er allerede hentet.
export function ItemListe({ items }: { items: ItemTilListe[] }) {
  const [valgt, setValgt] = useState<Status | null>(null);
  const synlige = valgt ? items.filter((i) => i.status === valgt) : items;

  const chipKlasser = (aktiv: boolean) =>
    `min-h-touch rounded-stram border border-koks px-3 font-mono text-detalje font-medium transition ${
      aktiv ? "bg-koks text-kalk" : "bg-flade text-koks hover:bg-hoer/50"
    }`;

  return (
    <div>
      {/* Filteret vises kun, når der er noget at filtrere i */}
      {items.length > 3 ? (
        <div
          role="group"
          aria-label={da.oversigt.filterLabel}
          className="mt-6 flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setValgt(null)}
            aria-pressed={valgt === null}
            className={chipKlasser(valgt === null)}
          >
            {da.oversigt.filterAlle} · {items.length}
          </button>
          {STATUSSER.map((status) => {
            const antal = items.filter((i) => i.status === status).length;
            if (antal === 0) return null;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setValgt(valgt === status ? null : status)}
                aria-pressed={valgt === status}
                className={chipKlasser(valgt === status)}
              >
                {da.oversigt.status[status]} · {antal}
              </button>
            );
          })}
        </div>
      ) : null}

      {synlige.length === 0 ? (
        <p className="mt-6 max-w-laesbar text-tekst/70">{da.oversigt.filterTom}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {synlige.map((item) => (
            <li key={item.id}>
              {/* Roligt, interaktivt kort: kanten mørkner på hover/fokus */}
              <div className="kort-klik flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/items/${item.id}`}
                    className="soem-link min-w-0 flex-1 font-medium"
                  >
                    <span className="block truncate">{item.titel}</span>
                  </Link>
                  <Badge variant={item.status === "sold" ? "status" : "neutral"}>
                    {da.oversigt.status[item.status]}
                  </Badge>
                </div>
                {item.status === "sold" && item.soldPrisDkk != null ? (
                  <p className="font-mono text-detalje font-bold text-pris">
                    {item.soldPrisDkk} kr.
                  </p>
                ) : null}
                {item.status === "active" ? <MarkerSolgt itemId={item.id} /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
