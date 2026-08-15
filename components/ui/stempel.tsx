import type { HTMLAttributes } from "react";

// Stille mono-mærkat i system-stemmen: 1 px kant, ingen rotation, ingen
// stempel-teatralik. Farver følger AA-reglerne: ravDyb-tekst på lyse flader;
// kalk-variant til gran/koks-blokke. Doseret: maks. én pr. view.
type StempelProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "rav" | "kalk";
};

const VARIANTER: Record<NonNullable<StempelProps["variant"]>, string> = {
  rav: "border-rav/60 text-ravDyb",
  kalk: "border-kalk/40 text-kalk",
};

export function Stempel({
  variant = "rav",
  className = "",
  children,
  ...rest
}: StempelProps) {
  return (
    <span
      className={`inline-block rounded-stram border px-2.5 py-1 font-mono text-detalje font-medium uppercase tracking-wide ${VARIANTER[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
