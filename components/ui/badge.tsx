import type { HTMLAttributes } from "react";

type Variant = "neutral" | "status" | "visualisering";

// Mono-uppercase er badge-sproget (DESIGN.md §3). Varianten `visualisering`
// er UI-mærkningen af AI-genererede billeder (C-4) — selve den indlejrede
// badge i billedfilen laves af /lib/pipeline/badge.ts (S4).
type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const varianter: Record<Variant, string> = {
  neutral: "border-kant bg-flade text-tekst",
  status: "border-gran bg-gran text-primaer-tekst",
  visualisering: "border-koks bg-koks text-kalk",
};

export function Badge({
  variant = "neutral",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-stram border px-2 py-0.5 font-mono text-detalje uppercase tracking-wide ${varianter[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
