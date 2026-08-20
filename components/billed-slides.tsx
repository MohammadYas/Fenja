"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { KatalogBillede } from "@/lib/copy/katalog-billeder";

// "Tøjet vist båret" som glidende slide (ejer-ordrer 2026-08-20): alle
// katalogbilleder kører i én kontinuerlig, sømløs glidning — trin-skift
// hakkede (ejer-feedback). Fremdriften er rAF-drevet transform (immun mod
// forced reduced motion og Chromes drop af native smooth-scroll uden for
// viewportet); IntersectionObserver holder pause off-screen. Sporet består
// af to identiske halvdele → sømløs løkke. Pause ved hover/fokus/berøring.
export function BilledSlides({ billeder }: { billeder: KatalogBillede[] }) {
  const sporRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const spor = sporRef.current;
    if (!spor) return;

    // Ejer-ordre 2026-08-20: ingen pause ved hover — sliden kører konstant
    let synlig = true;
    const observer = new IntersectionObserver((poster) => {
      synlig = poster[0]?.isIntersecting ?? true;
    });
    observer.observe(spor);

    const FART_PX_PR_SEK = 34;
    let position = 0;
    let sidst = performance.now();
    let raf = 0;
    const trin = (nu: number) => {
      const dt = (nu - sidst) / 1000;
      sidst = nu;
      const halv = spor.scrollWidth / 2;
      if (halv > 0 && synlig && !document.hidden) {
        position = (position + FART_PX_PR_SEK * dt) % halv;
        spor.style.transform = `translateX(${-position}px)`;
      }
      raf = requestAnimationFrame(trin);
    };
    raf = requestAnimationFrame(trin);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="stroem mt-6" aria-label="Billedserie — kører automatisk">
      <ul ref={sporRef} className="stroem-spor">
        {billeder.map((billede, i) => (
          <li key={billede.src} className="slides-kort">
            <Image
              src={billede.src}
              alt={billede.alt}
              width={900}
              height={1350}
              sizes="224px"
              loading={i < 6 ? "eager" : "lazy"}
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
        {billeder.map((billede) => (
          <li
            key={`${billede.src}-dublet`}
            className="slides-kort"
            aria-hidden="true"
          >
            <Image
              src={billede.src}
              alt=""
              width={900}
              height={1350}
              sizes="224px"
              loading="lazy"
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
