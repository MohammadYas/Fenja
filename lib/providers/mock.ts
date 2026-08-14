// Mock-providers til test/CI og udvikling uden nøgler (C-7, NFR-5).
// Deterministiske og konfigurerbare, så fejlveje (B-6) kan testes.

import type {
  BaggrundsrensInput,
  BaggrundsrensResultat,
  ImageProvider,
  OnModelInput,
  OnModelResultat,
} from "./image";
import type {
  AnnonceTekst,
  AnnonceTekstInput,
  LabelInput,
  LabelResultat,
  TextProvider,
  TroskabsInput,
  TroskabsResultat,
} from "./text";
import type { VideoKlipInput, VideoKlipResultat, VideoProvider } from "./video";

export type MockOpsaetning = {
  /** Kast fejl ved on-model-generering (tester delvis leverance, B-6) */
  onModelFejler?: boolean;
  /** Fast troskabs-score; default over tærsklen */
  troskabsScore?: number;
  /** Kast fejl ved baggrundsrens */
  rensFejler?: boolean;
  labelTekst?: string | null;
};

export class MockImageProvider implements ImageProvider {
  kald: string[] = [];

  constructor(private opsaetning: MockOpsaetning = {}) {}

  async rensBaggrund(input: BaggrundsrensInput): Promise<BaggrundsrensResultat> {
    this.kald.push(`rens:${input.fotoUrl}`);
    if (this.opsaetning.rensFejler) {
      throw new Error("mock: baggrundsrens fejlede");
    }
    return { url: `${input.fotoUrl}#renset`, costDkk: 0.1 };
  }

  async genererOnModel(input: OnModelInput): Promise<OnModelResultat> {
    this.kald.push(`onmodel:vaegt=${input.referenceVaegt}`);
    if (this.opsaetning.onModelFejler) {
      throw new Error("mock: on-model-generering fejlede");
    }
    return {
      url: `${input.referenceUrl}#onmodel-${this.kald.length}`,
      providerJobId: `mock-job-${this.kald.length}`,
      costDkk: 0.35,
    };
  }
}

export class MockTextProvider implements TextProvider {
  kald: string[] = [];

  constructor(private opsaetning: MockOpsaetning = {}) {}

  async genererAnnonceTekst(input: AnnonceTekstInput): Promise<AnnonceTekst> {
    this.kald.push("tekst");
    const fejlDel = input.fejlBeskrivelse
      ? ` Bemærk: ${input.fejlBeskrivelse}.`
      : "";
    const materialeDel = input.labelTekst ? ` Materiale: ${input.labelTekst}.` : "";
    return {
      titel: `${input.maerke} ${input.kategori} str. ${input.stoerrelse}`,
      beskrivelse:
        `Fin ${input.kategori.toLowerCase()} fra ${input.maerke} i størrelse ${input.stoerrelse}. ` +
        `Stand: ${input.stand}.${fejlDel}${materialeDel} Sender gerne med det samme.`,
      soegeord: [input.maerke, input.kategori, input.stoerrelse],
      prisforslagDkk: { fra: 80, til: 120 },
      prisBegrundelse: `Lignende ${input.maerke}-${input.kategori.toLowerCase()} ligger typisk 80–120 kr.`,
      costDkk: 0.15,
    };
  }

  async vurderTroskab(_input: TroskabsInput): Promise<TroskabsResultat> {
    this.kald.push("troskab");
    return {
      score: this.opsaetning.troskabsScore ?? 0.9,
      begrundelse: "mock: print, farve og snit matcher referencen",
      costDkk: 0.05,
    };
  }

  async aflaesLabel(_input: LabelInput): Promise<LabelResultat> {
    this.kald.push("label");
    return { tekst: this.opsaetning.labelTekst ?? "100 % bomuld, vask ved 30°", costDkk: 0.05 };
  }
}

export class MockVideoProvider implements VideoProvider {
  async genererKlip(_input: VideoKlipInput): Promise<VideoKlipResultat> {
    throw new Error("VideoProvider implementeres først i fase B (Tillæg B)");
  }
}
