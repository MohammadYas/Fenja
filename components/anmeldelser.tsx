import Image from "next/image";
import { vinted } from "@/lib/copy/vinted";

// Anmeldelses-billedet i heroen (EJER-ORDRE 2026-08-20: skal være et BILLEDE,
// klippet som screenshots — ikke en kodet komponent). Genskabt 1:1 fra
// ejerens screenshot-collage (fire Vinted-sælgerprofiler, navne sløret) som
// canvas-tegning → public/eksempler/anmeldelser-vinted.webp. Illustrativt,
// IKKE Selja-kunder (ejer-overstyring af "ingen fabrikeret proof" —
// registreret i STATUS). Ingen navne, ingen Selja-påstand.
export function Anmeldelser() {
  return (
    <figure className="mt-4">
      <Image
        src="/eksempler/anmeldelser-vinted.webp"
        alt="Fire Vinted-sælgerprofiler med anmeldelser: 4,3 · 4,8 · 5,0 og 4,6 stjerner"
        width={1400}
        height={1120}
        sizes="(min-width: 1024px) 640px, 100vw"
        className="w-full rounded-bloed border border-kant"
      />
      <figcaption className="mt-2 text-detalje text-tekst/70">
        {vinted.anmeldelser.undertekst}
      </figcaption>
    </figure>
  );
}
