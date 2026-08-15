"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { bevaegelse } from "@/lib/design/tokens";

// Scroll-reveal (REDESIGN §2.5): sektioner fader/løfter 12 px ind, én gang,
// rå IntersectionObserver — ingen biblioteker. Selve skjul/vis-tilstanden bor i
// globals.css bag @media (scripting: enabled) og prefers-reduced-motion, så
// uden JS eller med reduceret bevægelse vises alt med det samme.
export function Reveal({
  children,
  forsinkelseTrin = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger-trin (× bevaegelse.stagger) — deterministisk pr. element */
  forsinkelseTrin?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (poster) => {
        if (poster[0]?.isIntersecting) {
          element.dataset.reveal = "vist";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style = {
    "--reveal-forsinkelse": `calc(${forsinkelseTrin} * ${bevaegelse.stagger})`,
  } as CSSProperties;

  return (
    <div ref={ref} data-reveal="" style={style} className={className}>
      {children}
    </div>
  );
}
