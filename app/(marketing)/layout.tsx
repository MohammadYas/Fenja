import Link from "next/link";
import { da } from "@/lib/copy/da";

// Marketing-skal: enkel topbar + footer. Mobil-først. Links bruger sømmen som
// hover-markering (REDESIGN §2.4) — aldrig standard-underline.
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header>
        <nav
          aria-label="Hovednavigation"
          className="mx-auto flex min-h-touch max-w-5xl items-center justify-between gap-4 px-4 py-1"
        >
          <Link href="/" className="soem-link font-display text-lead font-bold uppercase">
            {da.site.navn}
          </Link>
          <div className="flex items-center gap-4 text-detalje">
            <Link href="/laer" className="soem-link min-h-touch content-center font-medium">
              {da.nav.laer}
            </Link>
            <Link
              href="/log-ind"
              className="inline-flex min-h-touch items-center rounded-bloed bg-primaer px-4 font-medium text-primaer-tekst shadow-offset-hoer transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-offset-hoer-loeft"
            >
              {da.nav.logInd}
            </Link>
          </div>
        </nav>
        <div className="soem-vandret" aria-hidden="true" />
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-kant">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-detalje text-tekst/70">
          <span className="font-mono uppercase tracking-wide">{da.site.navn}</span>
          <Link href="/vilkaar" className="soem-link min-h-touch content-center">
            {da.footer.vilkaar}
          </Link>
          <Link href="/privatliv" className="soem-link min-h-touch content-center">
            {da.footer.privatliv}
          </Link>
        </div>
      </footer>
    </div>
  );
}
