import { JuridiskSide } from "@/components/juridisk-side";
import { da } from "@/lib/copy/da";

export const metadata = { title: `${da.vilkaar.titel} · ${da.site.navn}` };

export default function Vilkaar() {
  return (
    <JuridiskSide
      titel={da.vilkaar.titel}
      opdateret={da.vilkaar.opdateret}
      afsnit={da.vilkaar.afsnit}
    />
  );
}
