"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { da } from "@/lib/copy/da";

// Mobil-først bund-navigation for app-delen: 4 punkter, ikon + label,
// aktiv tilstand markeret med farve og Søm-markør (DESIGN.md §6).

const IKONER = {
  oversigt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  nytItem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  kreditter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7c0 2.6-5 1.4-5 3.9 0 1 1.1 1.7 2.5 1.7s2.5-.7 2.5-1.7" strokeLinecap="round" />
    </svg>
  ),
  konto: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5" strokeLinecap="round" />
    </svg>
  ),
} as const;

const PUNKTER = [
  { href: "/oversigt", label: da.nav.oversigt, ikon: IKONER.oversigt },
  { href: "/nyt-item", label: da.nav.nytItem, ikon: IKONER.nytItem },
  { href: "/kreditter", label: da.nav.kreditter, ikon: IKONER.kreditter },
  { href: "/konto", label: da.nav.konto, ikon: IKONER.konto },
] as const;

export function AppNav() {
  const sti = usePathname();

  return (
    <nav
      aria-label="Hovednavigation"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-kant bg-baggrund pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md">
        {PUNKTER.map((punkt) => {
          const aktiv = sti.startsWith(punkt.href);
          return (
            <li key={punkt.href} className="relative flex-1">
              {/* Aktiv fane markeres med søm-overkant + gran (REDESIGN §3.2) */}
              {aktiv ? (
                <span
                  aria-hidden="true"
                  className="soem-vandret absolute inset-x-3 top-0"
                />
              ) : null}
              <Link
                href={punkt.href}
                aria-current={aktiv ? "page" : undefined}
                className={`flex min-h-touch flex-col items-center gap-0.5 py-2 text-detalje ${
                  aktiv ? "font-medium text-primaer" : "text-tekst/70"
                }`}
              >
                {punkt.ikon}
                {punkt.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
