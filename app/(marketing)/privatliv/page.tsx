import { JuridiskSide } from "@/components/juridisk-side";
import { da } from "@/lib/copy/da";

export const metadata = { title: `${da.privatliv.titel} · ${da.site.navn}` };

export default function Privatliv() {
  return (
    <JuridiskSide
      titel={da.privatliv.titel}
      opdateret={da.privatliv.opdateret}
      afsnit={da.privatliv.afsnit}
    />
  );
}
