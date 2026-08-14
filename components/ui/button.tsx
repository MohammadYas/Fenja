"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primaer" | "sekundaer" | "stille" | "fejl";

// Knaptekster kommer altid fra /lib/copy/da.ts via children (NFR-12)
// og siger hvad de gør ("Lav min annonce", ikke "Kom i gang") — HANDOFF §2.2.4.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Deaktiverer knappen og viser at handlingen arbejder (async feedback) */
  travl?: boolean;
};

const varianter: Record<Variant, string> = {
  primaer: "bg-primaer text-primaer-tekst hover:opacity-90",
  sekundaer:
    "border border-koks bg-transparent text-tekst hover:bg-flade",
  stille: "bg-transparent text-primaer underline-offset-4 hover:underline",
  fejl: "bg-fejl text-primaer-tekst hover:opacity-90",
};

export function Button({
  variant = "primaer",
  travl = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || travl}
      aria-busy={travl || undefined}
      className={`inline-flex min-h-touch cursor-pointer items-center justify-center gap-2 rounded-bloed px-5 font-brod text-basis font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${varianter[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
