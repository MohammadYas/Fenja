import type { HTMLAttributes } from "react";

// Prislappen (REDESIGN §2.3): tøjets hangtag som gennemgående motiv for priser,
// kreditpakker, saldo og stempler. Hør-flade, koks-kant, afklippet hjørne og
// hul med cirkel-outline — geometrien bor i globals.css (.prislap). Rotationen
// er deterministisk pr. element (aldrig random, aldrig animeret).
type PrislapProps = HTMLAttributes<HTMLDivElement> & {
  rotation?: "venstre" | "hoejre" | "ingen";
  /** Kompakt variant til topbar/badges */
  taet?: boolean;
};

const ROTATIONER: Record<NonNullable<PrislapProps["rotation"]>, string> = {
  venstre: "rotate-lap-v",
  hoejre: "rotate-lap-h",
  ingen: "",
};

export function Prislap({
  rotation = "ingen",
  taet = false,
  className = "",
  children,
  ...rest
}: PrislapProps) {
  return (
    <div
      className={`prislap text-tekst ${
        taet ? "py-1 pl-6 pr-2.5" : "py-3 pl-7 pr-4"
      } ${ROTATIONER[rotation]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
