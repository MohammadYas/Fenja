import type { HTMLAttributes } from "react";

// Stemplet (REDESIGN §2.3): mono-uppercase i outline-boks, roteret som et
// håndstempel fra genbrugsbutikken. Doseret: maks. 1–2 pr. view (§5.3).
// Farver følger AA-reglerne: ravDyb-tekst på lyse flader; kalk-variant til gran.
type StempelProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "rav" | "kalk";
  roteret?: boolean;
};

const VARIANTER: Record<NonNullable<StempelProps["variant"]>, string> = {
  rav: "border-rav text-ravDyb",
  kalk: "border-kalk text-kalk",
};

export function Stempel({
  variant = "rav",
  roteret = true,
  className = "",
  children,
  ...rest
}: StempelProps) {
  return (
    <span
      className={`inline-block border-2 px-2.5 py-1 font-mono text-detalje font-bold uppercase tracking-wide ${VARIANTER[variant]} ${roteret ? "rotate-stempel" : ""} rounded-stram ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
