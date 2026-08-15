import type { HTMLAttributes } from "react";

// Flade adskilles med hør + 1 px kant — aldrig dekorative skygger (DESIGN.md §5).
// `klikbar` bruges på kort med interaktion i: kanten mørkner på hover/fokus.
type CardProps = HTMLAttributes<HTMLDivElement> & { klikbar?: boolean };

export function Card({ klikbar = false, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`${klikbar ? "kort-klik" : "rounded-bloed border border-kant bg-flade"} p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
