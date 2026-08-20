// Hele item-pipelinen (B-4..B-6, G-1, E-5): rens → [visualisering ∥ tekst] →
// badge → leverance med kredit-træk. Delvis leverance når visualiseringen
// fejler; kredit-refund sker automatisk. Genkørsel er sikker: ledgeren er
// idempotent pr. item, så dubletter aldrig koster dobbelt (E-4/NFR-10).

import { misbrugsvaern } from "@/lib/config";
import {
  refunderVisning,
  traekRegenerering,
  type LedgerDb,
} from "@/lib/credits/ledger";
import type { ImageProvider } from "@/lib/providers/image";
import type { AnnonceTekst, TextProvider } from "@/lib/providers/text";
import { paafoerBadge } from "./badge";
import { rensFotos, type RensetFoto } from "./cleanup";
import type { ItemTilPipeline, PipelineDb, PipelineStorage } from "./db";
import { genererValideretAnnonceTekst } from "./listing-text";
import { findMarkedsinterval } from "./markedspriser";
import { genererOnModelMedTroskab } from "./onmodel";
import { STANDARD_PRESET_ID, hentPreset } from "./presets";
import { byggPromptVersion } from "./skabeloner";
import {
  STANDARD_VISNING_ID,
  hentVisningsType,
  type VisningsType,
} from "./visninger";

export class BudgetloftFejl extends Error {
  constructor() {
    super("Dagens globale API-budget er nået — nye annoncer er sat på pause");
  }
}

export type PipelineResultat = {
  rensede: RensetFoto[];
  /** Første vellykkede visning — bevaret for eksisterende kald */
  visualisering: { sti: string; fidelityScore: number } | null;
  /** Alle valgte visninger med udfald (ejer-ordre 20/8: brugeren vælger selv) */
  visualiseringer: {
    visningId: string;
    sti: string;
    fidelityScore: number;
  }[];
  /** null når teksten fejlede — billederne leveres alligevel (bulletproof) */
  tekst: AnnonceTekst | null;
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

/**
 * Referencen til billedprovideren SKAL være noget den kan læse (data-URL) —
 * det rensede foto ligger som privat storage-STI, og et fetch på en sti
 * kastede i BEGGE onmodel-forsøg (femte root cause, 20/8: derfor 0 billeder
 * selv efter model-fixene). Bytes hentes via storage-laget og pakkes én gang.
 */
async function referenceTilProvider(
  deps: PipelineAfhaengigheder,
  stiEllerUrl: string,
): Promise<string> {
  if (stiEllerUrl.startsWith("data:") || stiEllerUrl.startsWith("http")) {
    return stiEllerUrl;
  }
  const buffer = await deps.storage.hentBillede(stiEllerUrl);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

function sov(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function visualiseringsTrin(
  deps: PipelineAfhaengigheder,
  item: ItemTilPipeline,
  referenceUrl: string,
  presetId: string,
  visning?: VisningsType,
): Promise<{ sti: string; fidelityScore: number; costDkk: number } | null> {
  const preset = hentPreset(presetId);
  // Sammensat version (FR-15/S31): preset + skabelon + hjem (+ valgt visning),
  // bygget af samme deterministiske valg som prompten.
  const promptVersion = byggPromptVersion({
    preset,
    kategori: item.kategori,
    userId: item.userId,
    hjemAnker: item.hjemAnker,
    visning,
  });
  // Én visnings nedbrud (provider-udfald m.m.) må ALDRIG vælte de andre
  // visninger eller teksten — ALT herinde fanges, og resten leverer.
  let genId: string;
  try {
    genId = await deps.db.startGenerering(item.id, "onmodel", presetId);
  } catch (fejl) {
    console.error(`Kunne ikke starte generering for ${item.id}:`, fejl);
    return null;
  }
  let udfald;
  try {
    udfald = await genererOnModelMedTroskab({
      image: deps.image,
      text: deps.text,
      itemId: item.id,
      presetId,
      referenceUrl,
      userId: item.userId,
      kategori: item.kategori,
      hjemAnker: item.hjemAnker,
      visning,
      koen: item.koen,
      haarFarve: item.haarFarve,
    });
  } catch (fejl) {
    console.error(`Visning ${visning?.id ?? "standard"} fejlede for ${item.id}:`, fejl);
    await deps.db.afslutGenerering(genId, {
      status: "failed",
      costDkk: 0,
      promptVersion,
    }).catch(() => {});
    return null;
  }

  if (!udfald.billede) {
    await deps.db.afslutGenerering(genId, {
      status: "failed",
      costDkk: udfald.costDkk,
      promptVersion,
    }).catch(() => {});
    return null;
  }

  // Badge + AI-metadata påføres ALTID før billedet rører eget storage (C-4) —
  // og et nedbrud her (storage/badge) må heller ikke vælte de andre visninger
  try {
    const raa = await deps.storage.hentBillede(udfald.billede.url);
    const medBadge = await paafoerBadge(raa);
    // Stien er unik pr. generering, så en regenerering (B-8) aldrig
    // overskriver en tidligere visualisering — resultatsiden læser output_url
    const sti = await deps.storage.gemBillede(
      `${item.userId}/${item.id}/visualisering-${genId}.jpg`,
      medBadge,
    );
    await deps.db.afslutGenerering(genId, {
      status: "succeeded",
      costDkk: udfald.costDkk,
      outputUrl: sti,
      fidelityScore: udfald.billede.fidelityScore,
      promptVersion,
      providerJobId: udfald.billede.providerJobId,
    });
    return { sti, fidelityScore: udfald.billede.fidelityScore, costDkk: udfald.costDkk };
  } catch (fejl) {
    console.error(`Lagring af visning ${visning?.id ?? "standard"} fejlede for ${item.id}:`, fejl);
    await deps.db.afslutGenerering(genId, {
      status: "failed",
      costDkk: udfald.costDkk,
      promptVersion,
    }).catch(() => {});
    return null;
  }
}

async function tekstTrin(
  deps: PipelineAfhaengigheder,
  item: ItemTilPipeline,
): Promise<AnnonceTekst> {
  const genId = await deps.db.startGenerering(item.id, "text");
  try {
    // Ejer-ordre 20/8: sælgeren SKRIVER label-info og farve — det er gratis
    // og præcist. Foto-aflæsning (D-3) er kun fallback for gamle items med
    // label-foto og ingen skrevet tekst.
    const skrevet =
      [
        item.farve ? `Farve: ${item.farve}` : null,
        item.labelTekst?.trim() || null,
      ]
        .filter(Boolean)
        .join(" · ") || null;
    const labelFoto = item.fotos.find((f) => f.rolle === "label");
    let labelTekst: string | null = skrevet;
    let labelCost = 0;
    if (!labelTekst && labelFoto) {
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
      // M2/D-4: committede markedstal som virkelighedstjek, når mærke+kategori
      // matcher en høstet søgning (null uden match — prompten er da som før)
      markedsinterval: findMarkedsinterval(item.maerke, item.kategori),
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

export class RegenGraenseFejl extends Error {
  constructor() {
    super("Grænsen for regenereringer af denne del er nået");
  }
}

export class RegenVisualiseringFejl extends Error {
  constructor() {
    super("Den nye visualisering ramte ikke kvalitetskravet — der er ikke trukket noget");
  }
}

export type RegenDel = "visualisering" | "tekst";

export type RegenResultat = {
  visualisering: { sti: string; fidelityScore: number } | null;
  tekst: AnnonceTekst | null;
  saldoEfter: number;
};

/**
 * B-8: regenerér én del af en leveret annonce til reduceret kreditpris.
 * Kreditten trækkes KUN når delen lykkes (idempotent pr. requestId) —
 * en fejlet visualisering koster ingenting og kaster RegenVisualiseringFejl.
 */
export async function koerRegenerering(
  deps: PipelineAfhaengigheder,
  itemId: string,
  del: RegenDel,
  opts: { requestId: string; presetId?: string },
): Promise<RegenResultat> {
  // Samme kill-switch som hovedpipelinen (E-5)
  const dagensForbrug = await deps.db.dagensOmkostningerDkk();
  if (dagensForbrug >= misbrugsvaern.dagligtBudgetloftDkk) {
    throw new BudgetloftFejl();
  }

  const item = await deps.db.hentItem(itemId);

  const kind = del === "visualisering" ? "onmodel" : "text";
  const antal = await deps.db.antalGenereringer(item.id, kind);
  if (antal >= misbrugsvaern.maksGenereringerPrDel) {
    throw new RegenGraenseFejl();
  }

  if (del === "visualisering") {
    // Referencen er det rensede helhedsfoto fra den oprindelige leverance
    const helhed =
      item.fotos.find((f) => f.rolle === "full") ?? item.fotos[0];
    if (!helhed) throw new Error("item mangler fotos");
    const visualisering = await visualiseringsTrin(
      deps,
      item,
      await referenceTilProvider(deps, helhed.rensetUrl ?? helhed.url),
      opts.presetId ?? STANDARD_PRESET_ID,
    );
    if (!visualisering) throw new RegenVisualiseringFejl();
    const saldo = await traekRegenerering(deps.ledger, item.userId, opts.requestId);
    return {
      visualisering: { sti: visualisering.sti, fidelityScore: visualisering.fidelityScore },
      tekst: null,
      saldoEfter: saldo,
    };
  }

  const tekst = await tekstTrin(deps, item);
  const saldo = await traekRegenerering(deps.ledger, item.userId, opts.requestId);
  return { visualisering: null, tekst, saldoEfter: saldo };
}

export async function koerItemPipeline(
  deps: PipelineAfhaengigheder,
  itemId: string,
  presetId: string = STANDARD_PRESET_ID,
  /** Brugerens valgte visninger (ejer-ordre 20/8); uden valg = spejlbilledet */
  visningIds?: readonly string[],
): Promise<PipelineResultat> {
  // Kill-switch: globalt dagligt budgetloft (E-5)
  const dagensForbrug = await deps.db.dagensOmkostningerDkk();
  if (dagensForbrug >= misbrugsvaern.dagligtBudgetloftDkk) {
    throw new BudgetloftFejl();
  }

  const item = await deps.db.hentItem(itemId);
  const visninger = (
    visningIds?.length ? visningIds : [STANDARD_VISNING_ID]
  )
    .map(hentVisningsType)
    .filter((v): v is VisningsType => v !== undefined);
  if (visninger.length === 0) {
    visninger.push(hentVisningsType(STANDARD_VISNING_ID)!);
  }

  // Trin 1: rens (alle fotos parallelt)
  const rensede = await rensTrin(deps, item);
  const helhed =
    rensede.find(
      (f) => item.fotos.find((i) => i.id === f.fotoId)?.rolle === "full",
    ) ?? rensede[0]!;

  // Trin 2+3 parallelt: alle valgte visninger og annonceteksten (NFR-3).
  // Referencen pakkes som data-URL én gang og deles af alle visninger.
  // Bulletproof (ejer-ordre 20/8): en fejlet tekst må ALDRIG tage billederne
  // med i faldet — teksten bliver til null, billederne leveres alligevel.
  // Visningerne startes med et lille skridt imellem (350 ms), så de fire
  // provider-kald ikke rammer API'et i præcis samme sekund (rate limits) —
  // svarerne lander stadig næsten samtidig.
  const reference = await referenceTilProvider(deps, helhed.rensetUrl);
  const [tekst, ...visningsUdfald] = await Promise.all([
    tekstTrin(deps, item).catch((fejl) => {
      console.error(`Teksttrin fejlede for ${item.id}:`, fejl);
      return null;
    }),
    ...visninger.map((visning, i) =>
      sov(i * 350).then(() =>
        visualiseringsTrin(deps, item, reference, presetId, visning).then(
          (resultat) => ({ visning, resultat }),
        ),
      ),
    ),
  ]);
  type Vellykket = {
    visning: VisningsType;
    resultat: { sti: string; fidelityScore: number; costDkk: number };
  };
  const vellykkede = visningsUdfald.filter(
    (u): u is Vellykket => u.resultat !== null,
  );

  // Kredit-flow (ejer-ordre 20/8): kreditterne er allerede RESERVERET ved
  // oprettelsen (1 pr. valgt visning, idempotent — se reserverVisninger i
  // opret-API'et). Her refunderes hvert FEJLET billede automatisk, idempotent
  // pr. (item, visning) — så en genkørsel aldrig refunderer dobbelt, og
  // vellykkede billeder aldrig bliver gratis. Rens + tekst leveres altid (B-6).
  await deps.db.markerLeveret(item.id);
  let saldo = await deps.ledger.hentSaldo(item.userId);
  const refunderet = vellykkede.length === 0;
  for (const udfald of visningsUdfald) {
    if (udfald.resultat === null) {
      saldo = await refunderVisning(
        deps.ledger,
        item.userId,
        item.id,
        udfald.visning.id,
      );
    }
  }

  const totalCost =
    rensede.reduce((sum, f) => sum + f.costDkk, 0) +
    visningsUdfald.reduce((sum, u) => sum + (u.resultat?.costDkk ?? 0), 0) +
    (tekst?.costDkk ?? 0);

  const foerste = vellykkede[0]?.resultat ?? null;
  return {
    rensede,
    visualisering: foerste
      ? { sti: foerste.sti, fidelityScore: foerste.fidelityScore }
      : null,
    visualiseringer: vellykkede.map((u) => ({
      visningId: u.visning.id,
      sti: u.resultat.sti,
      fidelityScore: u.resultat.fidelityScore,
    })),
    tekst,
    totalCostDkk: totalCost,
    saldoEfter: saldo,
    refunderet,
  };
}
