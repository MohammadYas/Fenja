import Image from "next/image";
import { vinted } from "@/lib/copy/vinted";

// Before/after-panelet — signatur-elementet (DESIGN.md): den sjuskede annonce
// mod den færdige leverance, adskilt af sømmen. Ejer-ordre 2026-08-19: panelet
// viser nu RIGTIGE billeder fra katalogserien — FØR er det bevidst dårlige
// hverdagsfoto (p13), EFTER er samme mørkeblå strik vist båret (p6). Begge er
// AI-genererede visualiseringer (provenance: docs/katalog-prompts.md).
export function FoerEfter() {
  return (
    <figure>
      <div className="grid overflow-hidden rounded-bloed border border-kant sm:grid-cols-[1fr_auto_1.2fr]">
        <div className="bg-flade p-5">
          <span className="font-mono text-detalje font-medium uppercase tracking-wide text-tekst/70">
            {vinted.foerEfter.foer.label}
          </span>
          <Image
            src="/eksempler/katalog/p13-foer-billede.webp"
            alt="Sjusket hverdagsfoto af mørkeblå striktrøje smidt på en seng i dårligt lys"
            width={900}
            height={1350}
            sizes="(min-width: 640px) 240px, 80vw"
            className="mt-3 aspect-[4/3] w-full rounded-bloed border border-kant object-cover"
          />
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
          <Image
            src="/eksempler/katalog/p6-vaerelse-strik-mand.webp"
            alt="Spejlselfie hvor den mørkeblå striktrøje vises båret"
            width={900}
            height={1350}
            sizes="(min-width: 640px) 280px, 80vw"
            className="mt-3 aspect-[4/3] w-full rounded-bloed border border-kant object-cover object-top"
          />
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
    </figure>
  );
}
