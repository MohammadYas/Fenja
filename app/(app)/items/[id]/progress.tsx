"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { da } from "@/lib/copy/da";
import { beregnProcent, forventetSekunder } from "@/lib/fremdrift";

type TrinStatus = "venter" | "running" | "succeeded" | "failed";
type Trin = { kind: string; status: string };
type StatusSvar = {
  leveret: boolean;
  fejlet: boolean;
  startetAt: string | null;
  forventetSekunder: number;
  billeder: string[];
  trin: Trin[];
};

// Kun de trin brugeren skal forholde sig til (ejer-ordrer 20/8: "renser dine
// fotos" er væk, og 01 er annonceteksten, 02 er billederne)
const TRIN_ORDEN = ["text", "onmodel"] as const;

// Progress med reelle trin (B-4), bulletproof + ærlig om tempoet (ejer-ordrer
// 20/8): kurven er forankret i serverens starttid og skaleret efter antal
// billeder (2-3 min pr. billede); færdige billeder vises LØBENDE, så snart
// de er klar; fejlede/hængende kørsler får en genstart-knap.
export function Progress({
  itemId,
  startetAt: startetAtProp,
}: {
  itemId: string;
  /** Annoncens created_at fra serveren — baren står rigtigt fra første paint */
  startetAt?: string;
}) {
  const router = useRouter();
  const [trin, setTrin] = useState<Trin[]>([]);
  const [billeder, setBilleder] = useState<string[]>([]);
  const [fejlet, setFejlet] = useState(false);
  const [genstarter, setGenstarter] = useState(false);
  const startetAt = useRef<number | null>(
    startetAtProp ? new Date(startetAtProp).getTime() : null,
  );
  const faldbackStart = useRef<number>(Date.now());
  const forventet = useRef<number>(forventetSekunder(1));
  // Puls driver både procenttallet og de roterende genererings-tekster
  const [tik, setTik] = useState(0);

  useEffect(() => {
    const puls = setInterval(() => setTik((t) => t + 1), 400);
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
        // Stabil visning (ejer-klage: billedet "loadede forfra" igen og
        // igen): allerede viste billeder beholdes — nye tilføjes kun bagpå
        setBilleder((prev) =>
          (data.billeder ?? []).length > prev.length
            ? [...prev, ...(data.billeder ?? []).slice(prev.length)]
            : prev,
        );
        setFejlet(data.fejlet);
        if (data.forventetSekunder) forventet.current = data.forventetSekunder;
        if (data.startetAt) {
          startetAt.current = new Date(data.startetAt).getTime();
        }
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

  // ÉN fælles beregning (lib/fremdrift.ts) — samme tal som på oversigten
  void tik; // pulsen driver re-render
  const procent = beregnProcent({
    startetAtMs: startetAt.current ?? faldbackStart.current,
    nuMs: Date.now(),
    forventetSek: forventet.current,
    trin,
  });

  // Frames pr. valgt billede (ejer-ordre 20/8): hvert billede har sin egen
  // ramme med genererings-effekt, som afløses af billedet, når det er klar
  const antalFrames = Math.max(raekkerFor("onmodel").length, billeder.length);
  const faerdigeBilledeVisning = antalFrames > 0 && (
    <div className="mt-6">
      <p className="font-mono text-detalje font-bold tracking-wide text-tekst/70">
        {billeder.length > 0
          ? da.resultat.faerdigeBilleder(billeder.length)
          : da.resultat.billederPaaVej}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {Array.from({ length: antalFrames }, (_, i) =>
          billeder[i] ? (
            // Klik = fuld størrelse (ejer-ordre 20/8: man skal kunne zoome)
            <a
              key={`billede-${i}`}
              href={billeder[i]}
              target="_blank"
              rel="noreferrer"
              title={da.resultat.aabnFuldStoerrelse}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={billeder[i]}
                alt={`Færdigt billede ${i + 1} — tryk for fuld størrelse`}
                className="pris-rul w-full rounded-bloed border border-kant"
              />
            </a>
          ) : (
            <div
              key={`frame-${i}`}
              className="genererer-frame flex aspect-[2/3] w-full flex-col justify-between rounded-bloed border border-kant p-3"
              role="img"
              aria-label={da.resultat.genererFrame}
            >
              {/* Levende frame (ejer-ordre 20/8: flere animationer): tre
                  pulserende prikker + roterende statustekst pr. frame */}
              <span className="genererer-prikker" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span
                key={(Math.floor(tik / 8) + i) % da.resultat.genererTekster.length}
                className="pris-rul font-mono text-detalje text-tekst/60"
              >
                {
                  da.resultat.genererTekster[
                    (Math.floor(tik / 8) + i) % da.resultat.genererTekster.length
                  ]
                }
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );

  if (fejlet) {
    return (
      <div className="mt-6">
        <div className="rounded-bloed border border-kant bg-flade p-5">
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
        {/* Allerede færdige billeder er ikke tabt — vis dem stadig */}
        {faerdigeBilledeVisning}
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
      {/* Ærlig forventning (ejer-ordre 20/8): 2-3 min pr. billede */}
      <p className="mt-2 max-w-laesbar text-detalje text-tekst/70">
        {da.resultat.tidsForventning}
      </p>
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
      {/* Billede 1 vises så snart det er klar (ejer-ordre 20/8) */}
      {faerdigeBilledeVisning}
    </div>
  );
}
