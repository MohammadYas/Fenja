"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { KatalogBillede } from "@/lib/copy/katalog-billeder";

// Annonce-strømmen (ejer-ordrer 2026-08-19/20): to modsat drivende rækker af
// katalogbilleder — en levende væg af annoncer. EJER-ORDRE 20/8: skal ALTID
// køre, også ved OS-niveau "reduceret bevægelse" — derfor requestAnimation-
// Frame-drevet transform i stedet for CSS-animation (browsere kan tvangs-
// klampe CSS-animationers varighed under forced reduced motion; det kan de
// ikke med rAF). Bevidst a11y-afvigelse, registreret i STATUS. Pause på
// hover/fokus består. Sporet består af to identiske halvdele → sømløs løkke.
function Raekke({
  billeder,
  retning,
}: {
  billeder: KatalogBillede[];
  retning: "venstre" | "hoejre";
}) {
  const sporRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const spor = sporRef.current;
    if (!spor) return;

    let pauset = false;
    const pause = () => {
      pauset = true;
    };
    const genoptag = () => {
      pauset = false;
    };
    spor.addEventListener("pointerenter", pause);
    spor.addEventListener("pointerleave", genoptag);
    spor.addEventListener("focusin", pause);
    spor.addEventListener("focusout", genoptag);

    const FART_PX_PR_SEK = retning === "venstre" ? 28 : 22;
    let position = 0;
    let sidst = performance.now();
    let raf = 0;

    const trin = (nu: number) => {
      const dt = (nu - sidst) / 1000;
      sidst = nu;
      const halv = spor.scrollWidth / 2;
      if (halv > 0 && !pauset && !document.hidden) {
        position = (position + FART_PX_PR_SEK * dt) % halv;
        const x = retning === "venstre" ? -position : position - halv;
        spor.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(trin);
    };
    raf = requestAnimationFrame(trin);

    return () => {
      cancelAnimationFrame(raf);
      spor.removeEventListener("pointerenter", pause);
      spor.removeEventListener("pointerleave", genoptag);
      spor.removeEventListener("focusin", pause);
      spor.removeEventListener("focusout", genoptag);
    };
  }, [retning]);

  return (
    <div className="stroem" data-retning={retning}>
      <ul ref={sporRef} className="stroem-spor">
        {billeder.map((billede) => (
          <li key={billede.src} className="stroem-kort">
            <Image
              src={billede.src}
              alt={billede.alt}
              width={900}
              height={1350}
              sizes="176px"
              loading="lazy"
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
        {billeder.map((billede) => (
          <li
            key={`${billede.src}-dublet`}
            className="stroem-kort"
            aria-hidden="true"
          >
            <Image
              src={billede.src}
              alt=""
              width={900}
              height={1350}
              sizes="176px"
              loading="lazy"
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Billedstroem({
  raekker,
}: {
  raekker: [KatalogBillede[], KatalogBillede[]];
}) {
  return (
    <div className="flex flex-col gap-4">
      <Raekke billeder={raekker[0]} retning="venstre" />
      <Raekke billeder={raekker[1]} retning="hoejre" />
    </div>
  );
}
