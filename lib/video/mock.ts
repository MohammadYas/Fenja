// Mock-implementering af det fulde VideoProvider-interface (fase B) til
// test/CI og udvikling uden nøgler (C-7, NFR-5). Deterministisk: ingen
// Date.now/Math.random — job-id'er er en tæller, og resultater/priser
// beregnes af faste formler ud fra inputtet.

import type {
  VideoJobInput,
  VideoJobKvittering,
  VideoJobStatus,
  VideoProvider,
  VideoResultat,
  VideoWebhookPayload,
} from "./provider";

export type MockVideoOpsaetning = {
  /** Jobbet ender i fase "fejlet" i stedet for "faerdig" */
  fejler?: boolean;
  /** Antal hentStatus-kald der returnerer "genererer" før jobbet er færdigt */
  statusKaldFoerFaerdig?: number;
};

/** Fast fejltekst i mock-fixtures */
export const MOCK_VIDEO_FEJL = "mock: videogenerering fejlede";

/** Deterministisk klippris-fixture: 0,50 kr. pr. sekund (Tillæg B-økonomi) */
export function mockKlipPrisDkk(varighedSek: number): number {
  return varighedSek * 0.5;
}

/** Deterministisk resultat-fixture for et indsendt job */
export function mockVideoResultat(
  providerJobId: string,
  input: VideoJobInput,
): VideoResultat {
  return {
    url: `https://mock.selja.local/video/${providerJobId}.mp4`,
    varighedSek: input.varighedSek,
    format: input.format,
    costDkk: mockKlipPrisDkk(input.varighedSek),
  };
}

type MockJob = {
  input: VideoJobInput;
  statusKald: number;
};

export class MockVideoProvider implements VideoProvider {
  kald: string[] = [];

  private jobs = new Map<string, MockJob>();
  private taeller = 0;

  constructor(private opsaetning: MockVideoOpsaetning = {}) {}

  async indsendJob(input: VideoJobInput): Promise<VideoJobKvittering> {
    this.taeller += 1;
    const providerJobId = `mock-video-job-${this.taeller}`;
    this.jobs.set(providerJobId, { input, statusKald: 0 });
    this.kald.push(`indsend:${providerJobId}:${input.tilstand}`);
    return { providerJobId };
  }

  async hentStatus(providerJobId: string): Promise<VideoJobStatus> {
    const job = this.hentJob(providerJobId);
    job.statusKald += 1;
    this.kald.push(`status:${providerJobId}:${job.statusKald}`);
    if (job.statusKald <= (this.opsaetning.statusKaldFoerFaerdig ?? 1)) {
      return { fase: "genererer" };
    }
    return this.opsaetning.fejler
      ? { fase: "fejlet", fejl: MOCK_VIDEO_FEJL }
      : { fase: "faerdig" };
  }

  async hentResultat(providerJobId: string): Promise<VideoResultat> {
    const job = this.hentJob(providerJobId);
    this.kald.push(`resultat:${providerJobId}`);
    if (this.opsaetning.fejler) {
      throw new Error(MOCK_VIDEO_FEJL);
    }
    if (job.statusKald <= (this.opsaetning.statusKaldFoerFaerdig ?? 1)) {
      throw new Error(`mock: job ${providerJobId} er ikke færdigt endnu`);
    }
    return mockVideoResultat(providerJobId, job.input);
  }

  /** Payloaden providerens webhook ville poste for jobbet (fixture til webhook-tests) */
  webhookPayload(providerJobId: string): VideoWebhookPayload {
    const job = this.hentJob(providerJobId);
    if (this.opsaetning.fejler) {
      return { providerJobId, udfald: "fejlet", fejl: MOCK_VIDEO_FEJL };
    }
    return {
      providerJobId,
      udfald: "faerdig",
      resultat: mockVideoResultat(providerJobId, job.input),
    };
  }

  private hentJob(providerJobId: string): MockJob {
    const job = this.jobs.get(providerJobId);
    if (!job) throw new Error(`Ukendt job: ${providerJobId}`);
    return job;
  }
}
