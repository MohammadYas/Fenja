// Hele item-pipelinen (B-4..B-6, G-1, E-5): rens → [visualisering ∥ tekst] →
// badge → leverance med kredit-træk. Delvis leverance når visualiseringen
// fejler; kredit-refund sker automatisk. Genkørsel er sikker: ledgeren er
// idempotent pr. item, så dubletter aldrig koster dobbelt (E-4/NFR-10).

import { misbrugsvaern } from "@/lib/config";
import { refunderOnModel, traekLevering, type LedgerDb } from "@/lib/credits/ledger";
import type { ImageProvider } from "@/lib/providers/image";
import type { AnnonceTekst, TextProvider } from "@/lib/providers/text";
import { paafoerBadge } from "./badge";
import { rensFotos, type RensetFoto } from "./cleanup";
import type { ItemTilPipeline, PipelineDb, PipelineStorage } from "./db";
import { genererValideretAnnonceTekst } from "./listing-text";
import { genererOnModelMedTroskab } from "./onmodel";
import { STANDARD_PRESET_ID, hentPreset } from "./presets";

export class BudgetloftFejl extends Error {
  constructor() {
    super("Dagens globale API-budget er nået — nye annoncer er sat på pause");
  }
}

export type PipelineResultat = {
  rensede: RensetFoto[];
  visualisering: { sti: string; fidelityScore: number } | null;
  tekst: AnnonceTekst;
  totalCostDkk: number;
  saldoEfter: number;
  refunderet: boolean;
};

export type PipelineAfhaengigheder = {
  db: PipelineDb;
  storage: PipelineStorage;
  image: ImageProvider;
  text: TextProvider;
  ledger: LedgerDb;
};

async function rensTrin(
  deps: PipelineAfhaengigheder,
  item: ItemTilPipeline,
): Promise<RensetFoto[]> {
  const genId = await deps.db.startGenerering(item.id, "cleanup");
  try {
    const rensede = await rensFotos(
      deps.image,
      item.fotos.map((f) => ({ fotoId: f.id, url: f.url })),
    );
    // Gem i eget private storage — provider-URLs er flygtige (NFR-4)
    const gemte = await Promise.all(
      rensede.map(async (foto) => {
        const buffer = await deps.storage.hentBillede(foto.rensetUrl);
        const sti = await deps.storage.gemBillede(
          `${item.userId}/${item.id}/renset-${foto.fotoId}.jpg`,
          buffer,
        );
        await deps.db.gemRensetFoto(foto.fotoId, sti);
        return { ...foto, rensetUrl: sti };
      }),
    );
    const cost = rensede.reduce((sum, f) => sum + f.costDkk, 0);
    await deps.db.afslutGenerering(genId, { status: "succeeded", costDkk: cost });
    return gemte;
  } catch (fejl) {
    await deps.db.afslutGenerering(genId, { status: "failed", costDkk: 0 });
    throw fejl;
  }
}

async function visualiseringsTrin(
  deps: PipelineAfhaengigheder,
  item: ItemTilPipeline,
  referenceUrl: string,
  presetId: string,
): Promise<{ sti: string; fidelityScore: number; costDkk: number } | null> {
  const preset = hentPreset(presetId);
  const genId = await deps.db.startGenerering(item.id, "onmodel", presetId);
  const udfald = await genererOnModelMedTroskab({
    image: deps.image,
    text: deps.text,
    itemId: item.id,
    presetId,
    referenceUrl,
  });

  if (!udfald.billede) {
    await deps.db.afslutGenerering(genId, {
      status: "failed",
      costDkk: udfald.costDkk,
      promptVersion: `${preset.id}@v${preset.version}`,
    });
    return null;
  }

  // Badge + AI-metadata påføres ALTID før billedet rører eget storage (C-4)
  const raa = await deps.storage.hentBillede(udfald.billede.url);
  const medBadge = await paafoerBadge(raa);
  const sti = await deps.storage.gemBillede(
    `${item.userId}/${item.id}/visualisering.jpg`,
    medBadge,
  );
  await deps.db.afslutGenerering(genId, {
    status: "succeeded",
    costDkk: udfald.costDkk,
    outputUrl: sti,
    fidelityScore: udfald.billede.fidelityScore,
    promptVersion: `${preset.id}@v${preset.version}`,
    providerJobId: udfald.billede.providerJobId,
  });
  return { sti, fidelityScore: udfald.billede.fidelityScore, costDkk: udfald.costDkk };
}

async function tekstTrin(
  deps: PipelineAfhaengigheder,
  item: ItemTilPipeline,
): Promise<AnnonceTekst> {
  const genId = await deps.db.startGenerering(item.id, "text");
  try {
    // Label aflæses når muligt og flettes ind (D-3)
    const labelFoto = item.fotos.find((f) => f.rolle === "label");
    let labelTekst: string | null = null;
    let labelCost = 0;
    if (labelFoto) {
      try {
        const label = await deps.text.aflaesLabel({ labelFotoUrl: labelFoto.url });
        labelTekst = label.tekst;
        labelCost = label.costDkk;
      } catch {
        // Ulæselig label må aldrig vælte leverancen
      }
    }

    const tekst = await genererValideretAnnonceTekst(deps.text, {
      maerke: item.maerke,
      stoerrelse: item.stoerrelse,
      stand: item.stand,
      kategori: item.kategori,
      fejlBeskrivelse: item.fejlBeskrivelse,
      labelTekst,
      koebsprisDkk: item.koebsprisDkk,
    });
    await deps.db.gemAnnonceTekst(item.id, tekst);
    await deps.db.afslutGenerering(genId, {
      status: "succeeded",
      costDkk: tekst.costDkk + labelCost,
    });
    return { ...tekst, costDkk: tekst.costDkk + labelCost };
  } catch (fejl) {
    await deps.db.afslutGenerering(genId, { status: "failed", costDkk: 0 });
    throw fejl;
  }
}

export async function koerItemPipeline(
  deps: PipelineAfhaengigheder,
  itemId: string,
  presetId: string = STANDARD_PRESET_ID,
): Promise<PipelineResultat> {
  // Kill-switch: globalt dagligt budgetloft (E-5)
  const dagensForbrug = await deps.db.dagensOmkostningerDkk();
  if (dagensForbrug >= misbrugsvaern.dagligtBudgetloftDkk) {
    throw new BudgetloftFejl();
  }

  const item = await deps.db.hentItem(itemId);

  // Trin 1: rens (alle fotos parallelt)
  const rensede = await rensTrin(deps, item);
  const helhed =
    rensede.find(
      (f) => item.fotos.find((i) => i.id === f.fotoId)?.rolle === "full",
    ) ?? rensede[0]!;

  // Trin 2+3 parallelt: visualisering og annoncetekst (NFR-3)
  const [visualisering, tekst] = await Promise.all([
    visualiseringsTrin(deps, item, helhed.rensetUrl, presetId),
    tekstTrin(deps, item),
  ]);

  // Leverance: kredit trækkes i samme flow som item markeres leveret (E-3).
  // Fejler visualiseringen, leveres rens + tekst, og kreditten refunderes (B-6).
  await deps.db.markerLeveret(item.id);
  let saldo = await traekLevering(deps.ledger, item.userId, item.id);
  const refunderet = visualisering === null;
  if (refunderet) {
    saldo = await refunderOnModel(deps.ledger, item.userId, item.id);
  }

  const totalCost =
    rensede.reduce((sum, f) => sum + f.costDkk, 0) +
    (visualisering?.costDkk ?? 0) +
    tekst.costDkk;

  return {
    rensede,
    visualisering: visualisering
      ? { sti: visualisering.sti, fidelityScore: visualisering.fidelityScore }
      : null,
    tekst,
    totalCostDkk: totalCost,
    saldoEfter: saldo,
    refunderet,
  };
}
