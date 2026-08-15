"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { da } from "@/lib/copy/da";

type TrinStatus = "venter" | "running" | "succeeded" | "failed";
type Trin = { kind: string; status: string };

const TRIN_ORDEN = ["cleanup", "onmodel", "text"] as const;

// Progress med reelle trin (B-4). Poller status og genindlæser siden ved
// leverance. Visningen er en søm, der "syr sig selv" hen over skærmen trin for
// trin (REDESIGN §2.5) — bredden animeres via .soem-fyld (CSS, respekterer
// prefers-reduced-motion globalt).
export function Progress({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [trin, setTrin] = useState<Trin[]>([]);

  useEffect(() => {
    let aktiv = true;
    const interval = setInterval(async () => {
      const svar = await fetch(`/api/items/${itemId}/status`);
      if (!svar.ok || !aktiv) return;
      const data = (await svar.json()) as { leveret: boolean; trin: Trin[] };
      setTrin(data.trin);
      if (data.leveret) {
        clearInterval(interval);
        router.refresh();
      }
    }, 2500);
    return () => {
      aktiv = false;
      clearInterval(interval);
    };
  }, [itemId, router]);

  function statusFor(kind: string): TrinStatus {
    const fundet = trin.find((t) => t.kind === kind);
    if (!fundet) return "venter";
    return fundet.status as TrinStatus;
  }

  const statusTekst: Record<TrinStatus, string> = {
    venter: da.resultat.trinVenter,
    running: da.resultat.trinIGang,
    succeeded: da.resultat.trinFaerdig,
    failed: da.resultat.trinFejlet,
  };

  // Sømmen fylder 1/3 pr. afsluttet trin, halvt for et trin i gang.
  const andel =
    TRIN_ORDEN.reduce((sum, kind) => {
      const status = statusFor(kind);
      if (status === "succeeded" || status === "failed") return sum + 1;
      if (status === "running") return sum + 0.5;
      return sum;
    }, 0) / TRIN_ORDEN.length;

  return (
    <div className="mt-6">
      <div className="soem-spor relative" aria-hidden="true">
        <div
          className="soem-fyld absolute inset-y-0 left-0"
          style={{ width: `${Math.round(andel * 100)}%` }}
        />
      </div>
      <ol className="mt-5 flex flex-col gap-3" aria-live="polite">
        {TRIN_ORDEN.map((kind, i) => {
          const status = statusFor(kind);
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
