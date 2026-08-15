import type { HTMLAttributes } from "react";

// Flade adskilles med hør + 1 px kant — aldrig dekorative skygger (DESIGN.md §5).
type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-bloed border border-kant bg-flade p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
