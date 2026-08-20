"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { da } from "@/lib/copy/da";

type TrinStatus = "venter" | "running" | "succeeded" | "failed";
type Trin = { kind: string; status: string };
type StatusSvar = {
  leveret: boolean;
  fejlet: boolean;
  startetAt: string | null;
  trin: Trin[];
};

const TRIN_ORDEN = ["cleanup", "onmodel", "text"] as const;

// Progress med reelle trin (B-4), gjort bulletproof (ejer-ordrer 20/8):
// - Baren er psykologisk (altid fremad, hurtig start) og er forankret i
//   annoncens FAKTISKE starttid fra serveren — luk siden, sluk telefonen,
//   kom tilbage: kurven står hvor den skal, aldrig tilbage på 33 %.
// - Polling poller straks, og fejlede polls backer af (2,5 s → 15 s) uden
//   nogensinde at give op — et netudfald på nogle sekunder mærkes ikke.
// - Er kørslen fejlet eller hængende (fx server-genstart), vises en tydelig
//   genstart-knap i stedet for evig venten.
export function Progress({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [trin, setTrin] = useState<Trin[]>([]);
  const [fejlet, setFejlet] = useState(false);
  const [genstarter, setGenstarter] = useState(false);
  const [tidsAndel, setTidsAndel] = useState(0);
  const startetAt = useRef<number | null>(null);
  const faldbackStart = useRef<number>(Date.now());

  // Tidskurven: hurtig i starten, asymptotisk mod ~93 % — beregnet ud fra
  // serverens starttid, så et refresh aldrig nulstiller den
  useEffect(() => {
    const puls = setInterval(() => {
      const start = startetAt.current ?? faldbackStart.current;
      const sekunder = Math.max(0, (Date.now() - start) / 1000);
      setTidsAndel(0.93 * (1 - Math.exp(-sekunder / 35)));
    }, 400);
    return () => clearInterval(puls);
  }, []);

  useEffect(() => {
    let aktiv = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pauseMs = 2500;

    const poll = async () => {
      try {
        const svar = await fetch(`/api/items/${itemId}/status`);
        if (!aktiv) return;
        if (!svar.ok) throw new Error(String(svar.status));
        const data = (await svar.json()) as StatusSvar;
        if (!aktiv) return;
        pauseMs = 2500; // succes: tilbage til normal kadence
        setTrin(data.trin);
        setFejlet(data.fejlet);
        if (data.startetAt) startetAt.current = new Date(data.startetAt).getTime();
        if (data.leveret) {
          router.refresh();
          return;
        }
      } catch {
        // Netudfald: prøv igen med stigende pause — men giv aldrig op
        pauseMs = Math.min(pauseMs * 2, 15000);
      }
      timer = setTimeout(poll, pauseMs);
    };

    void poll(); // straks — et refresh viser status med det samme
    return () => {
      aktiv = false;
      if (timer) clearTimeout(timer);
    };
  }, [itemId, router]);

  async function genstart() {
    setGenstarter(true);
    try {
      const svar = await fetch(`/api/items/${itemId}/genoptag`, { method: "POST" });
      if (svar.ok) {
        setFejlet(false);
        startetAt.current = Date.now(); // ny kørsel, ny kurve
        faldbackStart.current = Date.now();
      }
    } finally {
      setGenstarter(false);
    }
  }

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

  // Reel andel: hvert hovedtrin vejer 1/3; billedtrinnet skalerer med hvor
  // mange af de valgte billeder der er færdige.
  const reelAndel =
    TRIN_ORDEN.reduce((sum, kind) => {
      const raekker = raekkerFor(kind);
      if (raekker.length === 0) return sum;
      const faerdige = raekker.filter(
        (r) => r.status === "succeeded" || r.status === "failed",
      ).length;
      if (faerdige === raekker.length) return sum + 1;
      return sum + Math.max(0.15, faerdige / raekker.length);
    }, 0) / TRIN_ORDEN.length;
  const procent = Math.min(97, Math.round(Math.max(tidsAndel, reelAndel) * 100));

  if (fejlet) {
    return (
      <div className="mt-6 rounded-bloed border border-kant bg-flade p-5">
        <p className="max-w-laesbar font-display text-lead font-semibold">
          {da.resultat.genoptagTitel}
        </p>
        <p className="mt-2 max-w-laesbar text-tekst/80">
          {da.resultat.genoptagTekst}
        </p>
        <button
          type="button"
          onClick={genstart}
          disabled={genstarter}
          className="mt-4 inline-flex min-h-touch items-center rounded-bloed border border-koks px-5 font-medium disabled:opacity-50"
        >
          {genstarter ? da.resultat.genoptagArbejder : da.resultat.genoptagKnap}
        </button>
      </div>
    );
  }

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
