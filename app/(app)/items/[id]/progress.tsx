"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { da } from "@/lib/copy/da";

type TrinStatus = "venter" | "running" | "succeeded" | "failed";
type Trin = { kind: string; status: string };

const TRIN_ORDEN = ["cleanup", "onmodel", "text"] as const;

// Progress med reelle trin (B-4). Poller straks og hvert 2,5 sekund og
// genindlæser siden ved leverance — et refresh lander altid på frisk status.
// Ejer-ordre 20/8: baren skal være TYDELIG — høj gran-bjælke med procenttal,
// og billedtrinnet tæller de valgte billeder (flere onmodel-rækker).
export function Progress({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [trin, setTrin] = useState<Trin[]>([]);

  useEffect(() => {
    let aktiv = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const svar = await fetch(`/api/items/${itemId}/status`);
        if (!svar.ok || !aktiv) return;
        const data = (await svar.json()) as { leveret: boolean; trin: Trin[] };
        if (!aktiv) return;
        setTrin(data.trin);
        if (data.leveret) {
          if (interval) clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Netværksglitch: næste poll prøver igen
      }
    };

    void poll(); // straks — et refresh viser status med det samme
    interval = setInterval(poll, 2500);
    return () => {
      aktiv = false;
      if (interval) clearInterval(interval);
    };
  }, [itemId, router]);

  const raekkerFor = (kind: string) => trin.filter((t) => t.kind === kind);

  function statusFor(kind: string): TrinStatus {
    const raekker = raekkerFor(kind);
    if (raekker.length === 0) return "venter";
    if (raekker.some((r) => r.status === "running")) return "running";
    if (raekker.some((r) => r.status === "succeeded")) return "succeeded";
    return raekker[0]!.status as TrinStatus;
  }

  const statusTekst: Record<TrinStatus, string> = {
    venter: da.resultat.trinVenter,
    running: da.resultat.trinIGang,
    succeeded: da.resultat.trinFaerdig,
    failed: da.resultat.trinFejlet,
  };

  // Andel: hvert hovedtrin vejer 1/3; billedtrinnet skalerer med hvor mange af
  // de valgte billeder der er færdige.
  const andel =
    TRIN_ORDEN.reduce((sum, kind) => {
      const raekker = raekkerFor(kind);
      if (raekker.length === 0) return sum;
      const faerdige = raekker.filter(
        (r) => r.status === "succeeded" || r.status === "failed",
      ).length;
      if (faerdige === raekker.length) return sum + 1;
      return sum + Math.max(0.15, faerdige / raekker.length);
    }, 0) / TRIN_ORDEN.length;
  const procent = Math.round(andel * 100);

  return (
    <div className="mt-6">
      {/* Tydelig fremdrift: procenttal + høj bjælke (ejer-ordre 20/8) */}
      <p
        className="font-mono text-titel font-bold text-gran"
        role="status"
        aria-live="polite"
      >
        {da.resultat.procentFaerdig(procent)}
      </p>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-stram bg-kant"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-stram bg-gran transition-[width] duration-700 ease-out"
          style={{ width: `${procent}%` }}
        />
      </div>
      <ol className="mt-5 flex flex-col gap-3">
        {TRIN_ORDEN.map((kind, i) => {
          const status = statusFor(kind);
          const raekker = raekkerFor(kind);
          const faerdigeBilleder = raekker.filter(
            (r) => r.status === "succeeded",
          ).length;
          return (
            <li key={kind} className="flex items-center gap-3">
              <span
                className={`font-mono text-detalje font-bold ${
                  status === "succeeded"
                    ? "text-primaer"
                    : status === "running"
                      ? "text-ravDyb"
                      : "text-tekst/50"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                {da.resultat.trin[kind as keyof typeof da.resultat.trin]}
                {kind === "onmodel" && raekker.length > 1 ? (
                  <span className="text-tekst/60">
                    {" "}
                    ({da.resultat.trinBilledTaeller(faerdigeBilleder, raekker.length)})
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-detalje uppercase tracking-wide text-tekst/70">
                {statusTekst[status]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
