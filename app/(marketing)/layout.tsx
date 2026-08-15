import Link from "next/link";
import { SpringLink } from "@/components/spring-link";
import { da } from "@/lib/copy/da";

// Marketing-skal: enkel topbar + footer. Mobil-først. Links bruger sømmen som
// hover-markering (REDESIGN §2.4) — aldrig standard-underline.
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SpringLink />
      <header>
        <nav
          aria-label="Hovednavigation"
          className="mx-auto flex min-h-touch max-w-5xl items-center justify-between gap-4 px-4 py-1"
        >
          <Link
            href="/"
            className="soem-link inline-flex min-h-touch items-center font-display text-lead font-bold"
          >
            {da.site.navn}
          </Link>
          <div className="flex items-center gap-4 text-detalje">
            <Link
              href="/#saadan"
              className="soem-link hidden min-h-touch items-center font-medium sm:inline-flex"
            >
              {da.nav.saadanVirkerDet}
            </Link>
            <Link href="/laer" className="soem-link inline-flex min-h-touch items-center font-medium">
              {da.nav.laer}
            </Link>
            <Link href="/priser" className="soem-link inline-flex min-h-touch items-center font-medium">
              {da.nav.priser}
            </Link>
            <Link href="/log-ind" className="knap-link px-4">
              {da.nav.logInd}
            </Link>
          </div>
        </nav>
        <div className="soem-vandret" aria-hidden="true" />
      </header>
      <div className="flex-1" id="indhold">{children}</div>
      {/* Footer som gran-blok (S23): ordmærke, grupperede links og
          mærknings-linjen — sidens sidste ord er det ærlige (REDESIGN §2.2) */}
      <footer className="bg-gran text-kalk">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-hero font-bold">
              {da.site.navn}
            </p>
            <p className="mt-3 max-w-laesbar text-detalje text-hoer">
              {da.footer.maerkning}
            </p>
            {/* Diskret vej til det parkerede B2B-spor (STRATEGISKIFT 2026-08-15) */}
            <p className="mt-6 text-detalje">
              <Link href="/studio" className="soem-link inline-flex min-h-touch items-center text-hoer">
                {da.footer.studio}
              </Link>
            </p>
          </div>
          <nav aria-label={da.footer.produktGruppe}>
            <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
              {da.footer.produktGruppe}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-detalje">
              <li>
                <Link href="/priser" className="soem-link inline-flex min-h-touch items-center">
                  {da.nav.priser}
                </Link>
              </li>
              <li>
                <Link href="/laer" className="soem-link inline-flex min-h-touch items-center">
                  {da.nav.laer}
                </Link>
              </li>
              <li>
                <Link href="/log-ind" className="soem-link inline-flex min-h-touch items-center">
                  {da.nav.logInd}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={da.footer.juraGruppe}>
            <p className="font-mono text-detalje font-bold tracking-wide text-hoer">
              {da.footer.juraGruppe}
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-detalje">
              <li>
                <Link href="/vilkaar" className="soem-link inline-flex min-h-touch items-center">
                  {da.footer.vilkaar}
                </Link>
              </li>
              <li>
                <Link href="/privatliv" className="soem-link inline-flex min-h-touch items-center">
                  {da.footer.privatliv}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
