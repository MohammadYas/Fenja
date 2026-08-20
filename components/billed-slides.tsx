"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { KatalogBillede } from "@/lib/copy/katalog-billeder";

// "Tøjet vist båret" som slides (ejer-ordre 2026-08-20): alle katalogbilleder
// kører rundt i et loopende slideshow — ét kort ad gangen hvert par sekunder,
// tilbage til start efter sidste. Native scroll-snap, så man også kan swipe/
// scrolle selv; auto-kørslen pauser ved hover/fokus/berøring og respekterer
// prefers-reduced-motion (så er den en almindelig manuel slider).
export function BilledSlides({ billeder }: { billeder: KatalogBillede[] }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const spor = ref.current;
    if (!spor) return;
    // EJER-ORDRE 2026-08-20: slidesene kører ALTID — også ved OS-niveau
    // "reduceret bevægelse" (ejeren kunne ellers ikke se dem køre).
    // Bevidst afvigelse fra reduced-motion-gaten; registreret i STATUS.

    let pauset = false;
    const saetPause = (vaerdi: boolean) => () => {
      pauset = vaerdi;
    };
    spor.addEventListener("pointerenter", saetPause(true));
    spor.addEventListener("pointerleave", saetPause(false));
    spor.addEventListener("focusin", saetPause(true));
    spor.addEventListener("focusout", saetPause(false));
    spor.addEventListener("touchstart", saetPause(true), { passive: true });
    spor.addEventListener("touchend", saetPause(false));

    const interval = window.setInterval(() => {
      if (pauset || document.hidden) return;
      const kort = spor.firstElementChild as HTMLElement | null;
      if (!kort) return;
      const trin = kort.offsetWidth + 16; // kortbredde + gap (spacing.4)
      const vedEnden =
        spor.scrollLeft + spor.clientWidth >= spor.scrollWidth - trin / 2;
      if (vedEnden) {
        spor.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        spor.scrollBy({ left: trin, behavior: "smooth" });
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <ul
      ref={ref}
      className="slides mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto"
      aria-label="Billedserie — kører automatisk, hold musen over for at pause"
    >
      {billeder.map((billede, i) => (
        <li
          key={billede.src}
          className="w-40 flex-shrink-0 snap-start sm:w-48 md:w-56"
        >
          <Image
            src={billede.src}
            alt={billede.alt}
            width={900}
            height={1350}
            sizes="(min-width: 768px) 224px, 176px"
            loading={i < 6 ? "eager" : "lazy"}
            className="w-full rounded-bloed border border-kant object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
