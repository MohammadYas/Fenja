"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { da } from "@/lib/copy/da";

type TrinStatus = "venter" | "running" | "succeeded" | "failed";
type Trin = { kind: string; status: string };

const TRIN_ORDEN = ["cleanup", "onmodel", "text"] as const;

// Progress med reelle trin (B-4). Poller status og genindlæser siden ved leverance.
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

  return (
    <ol className="mt-6 flex flex-col gap-3" aria-live="polite">
      {TRIN_ORDEN.map((kind) => {
        const status = statusFor(kind);
        return (
          <li key={kind} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-stram ${
                status === "succeeded"
                  ? "bg-gran"
                  : status === "running"
                    ? "bg-rav motion-safe:animate-pulse"
                    : status === "failed"
                      ? "bg-kant"
                      : "bg-kant"
              }`}
            />
            <span className="flex-1">
              {da.resultat.trin[kind as keyof typeof da.resultat.trin]}
            </span>
            <span className="font-mono text-detalje text-tekst/70">
              {statusTekst[status]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
