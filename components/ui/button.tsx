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

// Alt interaktivt reagerer (REDESIGN §2.5): knappen løfter 2 px og
// offset-skyggen vokser — solid hør/gran, aldrig blur, aldrig sort.
const loeft =
  "shadow-offset-hoer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset-hoer-loeft active:translate-x-0 active:translate-y-0 active:shadow-offset-hoer";

const varianter: Record<Variant, string> = {
  primaer: `bg-primaer text-primaer-tekst ${loeft}`,
  sekundaer: `border-2 border-koks bg-baggrund text-tekst ${loeft}`,
  stille: "bg-transparent text-primaer soem-link",
  fejl: `bg-fejl text-primaer-tekst ${loeft}`,
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
