"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";

// Felt med synlig label (aldrig placeholder-som-label), valgfri hjælpetekst og
// fejlbesked under feltet koblet med aria-describedby. Tekster kommer fra
// /lib/copy/da.ts via props (NFR-12). Fejlbeskeder forklarer hvad der skete og
// hvad man gør — uden undskyldnings-teater (HANDOFF §2.2.4).
type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  hjaelp?: string;
  fejl?: string;
};

export function Field({ label, hjaelp, fejl, className = "", ...rest }: FieldProps) {
  const id = useId();
  const hjaelpId = `${id}-hjaelp`;
  const fejlId = `${id}-fejl`;
  const describedBy =
    [hjaelp ? hjaelpId : null, fejl ? fejlId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-basis font-medium text-tekst">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={fejl ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-touch rounded-bloed border bg-baggrund px-3 text-basis text-tekst transition placeholder:text-tekst/50 ${
          fejl ? "border-fejl" : "border-kant"
        }`}
        {...rest}
      />
      {hjaelp ? (
        <p id={hjaelpId} className="text-detalje text-tekst/70">
          {hjaelp}
        </p>
      ) : null}
      {fejl ? (
        <p id={fejlId} role="alert" className="text-detalje text-fejl">
          {fejl}
        </p>
      ) : null}
    </div>
  );
}
