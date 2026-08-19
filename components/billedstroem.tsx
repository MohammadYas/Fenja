import Image from "next/image";
import {
  katalogRaekkeA,
  katalogRaekkeB,
  type KatalogBillede,
} from "@/lib/copy/katalog-billeder";

// Annonce-strømmen (ejer-ordre 2026-08-19: forsiden skal være animationsrig
// med hele katalogserien): to modsat drivende rækker af billeder — en levende
// væg af annoncer. Ren CSS-animation (globals.css .stroem-*), pause på hover.
// Uden scripting eller med reduceret bevægelse: statiske, side-scrollbare
// rækker — dubletterne til den sømløse løkke er skjult og aria-hidden.
function Raekke({
  billeder,
  retning,
}: {
  billeder: KatalogBillede[];
  retning: "venstre" | "hoejre";
}) {
  return (
    <div className="stroem" data-retning={retning}>
      <ul className="stroem-spor">
        {billeder.map((billede) => (
          <li key={billede.src} className="stroem-kort">
            <Image
              src={billede.src}
              alt={billede.alt}
              width={900}
              height={1350}
              sizes="176px"
              loading="lazy"
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
        {billeder.map((billede) => (
          <li
            key={`${billede.src}-dublet`}
            className="stroem-kort stroem-dublet"
            aria-hidden="true"
          >
            <Image
              src={billede.src}
              alt=""
              width={900}
              height={1350}
              sizes="176px"
              loading="lazy"
              className="h-full w-full rounded-bloed border border-kant object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Billedstroem() {
  return (
    <div className="flex flex-col gap-4">
      <Raekke billeder={katalogRaekkeA} retning="venstre" />
      <Raekke billeder={katalogRaekkeB} retning="hoejre" />
    </div>
  );
}
