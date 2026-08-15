import { vinted } from "@/lib/copy/vinted";

// DUBLET af forsidens before/after-panel (additiv-opgaven 2026-08-15: kopiér
// frem for at flytte — dubletten ryddes op i integrationsopgaven, se BACKLOG).
// Sømmen (lodret/vandret) er signatur-elementets skillelinje (DESIGN.md).
export function FoerEfter() {
  return (
    <figure>
      <div className="grid overflow-hidden rounded-bloed border border-kant sm:grid-cols-[1fr_auto_1.2fr]">
        <div className="bg-flade p-5">
          <span className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/60">
            {vinted.foerEfter.foer.label}
          </span>
          <p className="mt-3 font-mono text-detalje lowercase leading-snug text-tekst/80">
            {vinted.foerEfter.foer.tekst}
          </p>
          <p className="mt-1 font-mono text-detalje lowercase text-tekst/80">
            {vinted.foerEfter.foer.pris}
          </p>
        </div>
        <div className="soem-vandret sm:hidden" aria-hidden="true" />
        <div className="soem hidden sm:block" aria-hidden="true" />
        <div className="bg-baggrund p-5">
          <span className="font-mono text-detalje font-medium uppercase tracking-wide text-gran">
            {vinted.foerEfter.efter.label}
          </span>
          <p className="mt-3 font-display text-titel font-bold">
            {vinted.foerEfter.efter.titel}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-detalje text-tekst/80">
            {vinted.foerEfter.efter.punkter.map((punkt) => (
              <li key={punkt} className="flex gap-2">
                <span aria-hidden="true" className="text-tekst/40">
                  —
                </span>
                {punkt}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-detalje font-bold text-pris">
            {vinted.foerEfter.efter.pris}
          </p>
        </div>
      </div>
      <figcaption className="mt-3 text-detalje text-tekst/70">
        {vinted.foerEfter.note}
      </figcaption>
    </figure>
  );
}
