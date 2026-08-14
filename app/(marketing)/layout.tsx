import Link from "next/link";
import { da } from "@/lib/copy/da";

// Marketing-skal: enkel topbar + footer. Mobil-først, ingen app-krav.
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-kant">
        <nav
          aria-label="Hovednavigation"
          className="mx-auto flex min-h-touch max-w-5xl items-center justify-between gap-4 px-4"
        >
          <Link href="/" className="font-display text-lead font-semibold">
            {da.site.navn}
          </Link>
          <div className="flex items-center gap-4 text-detalje">
            <Link href="/laer" className="min-h-touch content-center">
              {da.nav.laer}
            </Link>
            <Link
              href="/log-ind"
              className="inline-flex min-h-touch items-center rounded-bloed bg-primaer px-4 font-medium text-primaer-tekst"
            >
              {da.nav.logInd}
            </Link>
          </div>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-kant">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-detalje text-tekst/70">
          <span>{da.site.navn}</span>
          <Link href="/vilkaar" className="min-h-touch content-center">
            {da.footer.vilkaar}
          </Link>
          <Link href="/privatliv" className="min-h-touch content-center">
            {da.footer.privatliv}
          </Link>
        </div>
      </footer>
    </div>
  );
}
