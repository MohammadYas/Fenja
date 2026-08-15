"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Billede = { src: string; alt: string };

// Rolig billedserie (v6.1, ejer-ordre): crossfade mellem billeder i fast 3:4-
// ramme. Auto-fremdrift hvert 4. sekund — men ALDRIG ved prefers-reduced-motion,
// og aldrig mens brugeren peger/fokuserer på serien. Prikkerne er rigtige
// knapper (touch-mål 44px via padding), så alt kan styres manuelt.
export function Billedserie({
  billeder,
  prioritet = false,
}: {
  billeder: readonly Billede[];
  prioritet?: boolean;
}) {
  const [aktiv, setAktiv] = useState(0);
  const [pauseret, setPauseret] = useState(false);
  const reduceretRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceretRef.current = mq.matches;
    const lyt = (e: MediaQueryListEvent) => {
      reduceretRef.current = e.matches;
    };
    mq.addEventListener("change", lyt);
    return () => mq.removeEventListener("change", lyt);
  }, []);

  useEffect(() => {
    if (pauseret) return;
    const interval = window.setInterval(() => {
      if (!reduceretRef.current && !document.hidden) {
        setAktiv((nu) => (nu + 1) % billeder.length);
      }
    }, 4000);
    return () => window.clearInterval(interval);
  }, [pauseret, billeder.length]);

  return (
    <div
      onPointerEnter={() => setPauseret(true)}
      onPointerLeave={() => setPauseret(false)}
      onFocus={() => setPauseret(true)}
      onBlur={() => setPauseret(false)}
    >
      <div className="relative aspect-[3/4] max-h-[560px] w-full overflow-hidden rounded-bloed border border-kant">
        {billeder.map((billede, i) => (
          <Image
            key={billede.src}
            src={billede.src}
            alt={i === aktiv ? billede.alt : ""}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            priority={prioritet && i === 0}
            aria-hidden={i !== aktiv}
            className={`object-cover transition-opacity duration-reveal ${
              i === aktiv ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-center" role="group" aria-label="Vælg billede">
        {billeder.map((billede, i) => (
          <button
            key={billede.src}
            type="button"
            aria-label={billede.alt}
            aria-current={i === aktiv || undefined}
            onClick={() => setAktiv(i)}
            className="cursor-pointer p-2.5"
          >
            <span
              aria-hidden="true"
              className={`block h-2 w-2 rounded-full transition ${
                i === aktiv ? "bg-primaer" : "bg-koks/25"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
