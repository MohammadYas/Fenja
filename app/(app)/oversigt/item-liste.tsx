"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { da } from "@/lib/copy/da";
import { beregnProcent, type FremdriftTrin } from "@/lib/fremdrift";
import { MarkerSolgt } from "./marker-solgt";

type Status = "draft" | "active" | "sold";

export type ItemTilListe = {
  id: string;
  titel: string;
  status: Status;
  soldPrisDkk: number | null;
  /** Signeret url til helhedsfotoet (ejer-ordre 20/8: genkendelig liste) */
  miniature: string | null;
  /** Kladde med kørende pipeline (B-9) — vises som "På vej" */
  paaVej: boolean;
  /** Kørslen gik i stå (bulletproof, 20/8) — åbn annoncen og kør igen */
  fejlet: boolean;
  /** Annoncens created_at — forankrer fremdriftskurven */
  startetAt: string;
};

// Mini-fremdrift på oversigten (ejer-ordre 20/8): samme forankrede kurve som
// annoncesiden, så den øjeblikkeligt står hvor kørslen faktisk er. Poller
// stille for leverance og genindlæser listen, når annoncen er klar.
function MiniFremdrift({ itemId, startetAt }: { itemId: string; startetAt: string }) {
  const router = useRouter();
  const start = new Date(startetAt).getTime();
  const [forventet, setForventet] = useState<number | undefined>(undefined);
  const [trin, setTrin] = useState<FremdriftTrin[]>([]);
  const [totalBilleder, setTotalBilleder] = useState<number | undefined>(undefined);
  const [fejlet, setFejlet] = useState(false);
  const [, setTik] = useState(0);
  // Monoton: procenten huskes, så baren aldrig kryber baglæns
  const maxProcent = useRef(0);

  useEffect(() => {
    const puls = setInterval(() => setTik((t) => t + 1), 1000);
    const poll = async () => {
      try {
        const svar = await fetch(`/api/items/${itemId}/status`);
        if (!svar.ok) return;
        const data = (await svar.json()) as {
          leveret: boolean;
          fejlet: boolean;
          forventetSekunder?: number;
          totalBilleder?: number;
          trin: FremdriftTrin[];
        };
        // Samme sandhed og SAMME tal som annoncesiden (ejer-ordre 20/8:
        // 86 % her og 75 % dér går ikke — fælles beregnProcent)
        setFejlet(data.fejlet);
        setTrin(data.trin ?? []);
        if (data.forventetSekunder) setForventet(data.forventetSekunder);
        if (data.totalBilleder) setTotalBilleder(data.totalBilleder);
        if (data.leveret) {
          clearInterval(pollInterval);
          router.refresh();
        }
      } catch {
        // Netudfald: næste poll prøver igen
      }
    };
    void poll(); // straks — tallet er rigtigt fra første sekund
    const pollInterval = setInterval(poll, 5000);
    return () => {
      clearInterval(puls);
      clearInterval(pollInterval);
    };
  }, [itemId, router]);

  const beregnet = beregnProcent({
    startetAtMs: start,
    nuMs: Date.now(),
    forventetSek: forventet,
    trin,
    totalBilleder,
  });
  maxProcent.current = Math.max(maxProcent.current, beregnet);
  const procent = maxProcent.current;

  if (fejlet) {
    return (
      <p className="font-mono text-detalje font-medium text-tekst/70">
        {da.oversigt.gikIStaa}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2" aria-label={da.oversigt.paaVej}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-stram bg-kant">
        <div
          className="h-full rounded-stram bg-gran"
          style={{ width: `${procent}%` }}
        />
      </div>
      <span className="font-mono text-detalje font-bold text-gran">
        {procent} %
      </span>
    </div>
  );
}

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
                    className="soem-link flex min-h-touch min-w-0 flex-1 items-center gap-3 font-medium"
                  >
                    {/* Miniature (ejer-ordre 20/8): flere af samme mærke skal
                        kunne kendes fra hinanden */}
                    {item.miniature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.miniature}
                        alt=""
                        className="h-12 w-12 flex-shrink-0 rounded-stram border border-kant object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="h-12 w-12 flex-shrink-0 rounded-stram border border-kant bg-flade"
                      />
                    )}
                    <span className="block truncate">{item.titel}</span>
                  </Link>
                  <Badge variant={item.status === "sold" ? "status" : "neutral"}>
                    {item.fejlet
                      ? da.oversigt.gikIStaa
                      : item.paaVej
                        ? da.oversigt.paaVej
                        : da.oversigt.status[item.status]}
                  </Badge>
                </div>
                {/* Fremdriften vises OGSÅ her (ejer-ordre 20/8) */}
                {item.paaVej && !item.fejlet ? (
                  <MiniFremdrift itemId={item.id} startetAt={item.startetAt} />
                ) : null}
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
