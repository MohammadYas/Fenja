// Baggrundsrens af ægte fotos (C-1/FR-2): kun global korrektion via provider —
// aldrig lokal retouch. Slid, pletter og fnuller bevares, fordi provideren kun
// fjerner baggrund og korrigerer lys globalt.

import type { ImageProvider } from "@/lib/providers/image";

export type RensetFoto = {
  fotoId: string;
  originalUrl: string;
  rensetUrl: string;
  costDkk: number;
};

export async function rensFotos(
  provider: ImageProvider,
  fotos: { fotoId: string; url: string }[],
): Promise<RensetFoto[]> {
  // Parallelle kald (NFR-3) — ét fejlet foto vælter ikke de andre
  const resultater = await Promise.allSettled(
    fotos.map(async (foto) => {
      const rens = await provider.rensBaggrund({ fotoUrl: foto.url });
      return {
        fotoId: foto.fotoId,
        originalUrl: foto.url,
        rensetUrl: rens.url,
        costDkk: rens.costDkk,
      } satisfies RensetFoto;
    }),
  );

  const ok = resultater
    .filter((r): r is PromiseFulfilledResult<RensetFoto> => r.status === "fulfilled")
    .map((r) => r.value);

  if (ok.length === 0) {
    throw new Error("Baggrundsrens fejlede for alle fotos");
  }
  return ok;
}
