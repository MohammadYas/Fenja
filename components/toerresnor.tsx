import type { ReactNode } from "react";

// Tørresnoren (S20): prislapperne hænger fra en vandret søm-snor i varierede
// højder — snor, klemme og lap som i genbrugsbutikken. Offsets og rotationer
// er deterministiske pr. indeks (REDESIGN §4), aldrig random.

const HAENG = [
  { luft: "pt-5", snor: "h-5" },
  { luft: "pt-10", snor: "h-10" },
  { luft: "pt-7", snor: "h-7" },
  { luft: "pt-12", snor: "h-12" },
] as const;

export function Toerresnor({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="soem-vandret" aria-hidden="true" />
      <ul className="flex flex-wrap items-start gap-x-10 gap-y-8">{children}</ul>
    </div>
  );
}

export function ToerresnorLap({
  indeks,
  children,
}: {
  indeks: number;
  children: ReactNode;
}) {
  const haeng = HAENG[indeks % HAENG.length]!;
  return (
    <li className={`relative ${haeng.luft}`}>
      {/* Snoren fra tørresnoren ned til lappen */}
      <span
        aria-hidden="true"
        className={`absolute left-8 top-0 w-px bg-hoer/70 ${haeng.snor}`}
      />
      <div className="relative">
        {/* Klemmen der holder lappen */}
        <span
          aria-hidden="true"
          className="absolute -top-2.5 left-6 z-10 h-4 w-2 rounded-stram border border-koks bg-hoer"
        />
        {children}
      </div>
    </li>
  );
}
