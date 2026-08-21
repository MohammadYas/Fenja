"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { da } from "@/lib/copy/da";

function erAktiv(sti: string, href: string): boolean {
  if (href === "/") return sti === href;
  return sti === href || sti.startsWith(`${href}/`);
}

function sideLinkKlasse(aktiv: boolean): string {
  return `soem-link inline-flex min-h-touch min-w-touch items-center justify-center px-2 font-medium ${
    aktiv ? "text-primaer" : ""
  }`;
}

export function MarketingNav() {
  const sti = usePathname();

  return (
    <nav
      aria-label="Hovednavigation"
      className="mx-auto flex min-h-touch max-w-5xl items-center justify-between gap-2 px-3 py-1 sm:gap-4 sm:px-4"
    >
      <Link
        href="/"
        aria-current={erAktiv(sti, "/") ? "page" : undefined}
        className="soem-link inline-flex min-h-touch items-center font-display text-lead font-bold"
      >
        {da.site.navn}
      </Link>
      <div className="flex items-center gap-1 text-detalje sm:gap-2">
        <Link
          href="/#saadan"
          aria-label={da.nav.saadanVirkerDet}
          className="soem-link inline-flex min-h-touch min-w-touch items-center justify-center px-2 font-medium"
        >
          <span className="sm:hidden">Sådan</span>
          <span className="hidden sm:inline">{da.nav.saadanVirkerDet}</span>
        </Link>
        <Link
          href="/laer"
          aria-current={erAktiv(sti, "/laer") ? "page" : undefined}
          className={sideLinkKlasse(erAktiv(sti, "/laer"))}
        >
          {da.nav.laer}
        </Link>
        <Link
          href="/priser"
          aria-current={erAktiv(sti, "/priser") ? "page" : undefined}
          className={sideLinkKlasse(erAktiv(sti, "/priser"))}
        >
          {da.nav.priser}
        </Link>
        <Link
          href="/log-ind"
          aria-current={erAktiv(sti, "/log-ind") ? "page" : undefined}
          className={`knap-link px-3 sm:px-4 ${
            erAktiv(sti, "/log-ind") ? "bg-koks" : ""
          }`}
        >
          {da.nav.logInd}
        </Link>
      </div>
    </nav>
  );
}
