import { describe, expect, it } from "vitest";
import {
  MOCK_VIDEO_FEJL,
  MockVideoProvider,
  mockKlipPrisDkk,
} from "@/lib/video/mock";
import type { VideoJobInput } from "@/lib/video/provider";

function basisJob(overrides: Partial<VideoJobInput> = {}): VideoJobInput {
  return {
    prompt: "Stil: ...\n\nKarakter: ...",
    promptVersion: 1,
    tilstand: "r2v",
    referenceUrls: ["https://x/person.jpg", "https://x/produkt.jpg"],
    varighedSek: 8,
    format: "9:16",
    webhookUrl: null,
    ...overrides,
  };
}

describe("MockVideoProvider · jobforløb", () => {
  it("indsender job med deterministisk job-id", async () => {
    const provider = new MockVideoProvider();
    const kvittering = await provider.indsendJob(basisJob());
    expect(kvittering.providerJobId).toBe("mock-video-job-1");
    const kvittering2 = await provider.indsendJob(basisJob());
    expect(kvittering2.providerJobId).toBe("mock-video-job-2");
  });

  it("går fra genererer til faerdig ved polling", async () => {
    const provider = new MockVideoProvider();
    const { providerJobId } = await provider.indsendJob(basisJob());
    expect(await provider.hentStatus(providerJobId)).toEqual({
      fase: "genererer",
    });
    expect(await provider.hentStatus(providerJobId)).toEqual({ fase: "faerdig" });
  });

  it("respekterer konfigurerbart antal statuskald før færdig", async () => {
    const provider = new MockVideoProvider({ statusKaldFoerFaerdig: 3 });
    const { providerJobId } = await provider.indsendJob(basisJob());
    for (let i = 0; i < 3; i++) {
      expect(await provider.hentStatus(providerJobId)).toEqual({
        fase: "genererer",
      });
    }
    expect(await provider.hentStatus(providerJobId)).toEqual({ fase: "faerdig" });
  });

  it("leverer resultat med deterministisk url og pris efter færdig status", async () => {
    const provider = new MockVideoProvider();
    const { providerJobId } = await provider.indsendJob(
      basisJob({ varighedSek: 10, format: "1:1" }),
    );
    await provider.hentStatus(providerJobId);
    await provider.hentStatus(providerJobId);
    const resultat = await provider.hentResultat(providerJobId);
    expect(resultat.url).toBe(
      "https://mock.selja.local/video/mock-video-job-1.mp4",
    );
    expect(resultat.varighedSek).toBe(10);
    expect(resultat.format).toBe("1:1");
    expect(resultat.costDkk).toBe(mockKlipPrisDkk(10));
  });

  it("kaster ved hentResultat før jobbet er færdigt", async () => {
    const provider = new MockVideoProvider();
    const { providerJobId } = await provider.indsendJob(basisJob());
    await expect(provider.hentResultat(providerJobId)).rejects.toThrow(
      /ikke færdigt/,
    );
  });

  it("kaster ved ukendt job-id", async () => {
    const provider = new MockVideoProvider();
    await expect(provider.hentStatus("findes-ikke")).rejects.toThrow(
      /Ukendt job/,
    );
  });
});

describe("MockVideoProvider · fejlvej (B-6-princippet)", () => {
  it("melder fejlet status med fejltekst", async () => {
    const provider = new MockVideoProvider({ fejler: true });
    const { providerJobId } = await provider.indsendJob(basisJob());
    await provider.hentStatus(providerJobId);
    expect(await provider.hentStatus(providerJobId)).toEqual({
      fase: "fejlet",
      fejl: MOCK_VIDEO_FEJL,
    });
  });

  it("kaster ved hentResultat for fejlet job", async () => {
    const provider = new MockVideoProvider({ fejler: true });
    const { providerJobId } = await provider.indsendJob(basisJob());
    await provider.hentStatus(providerJobId);
    await provider.hentStatus(providerJobId);
    await expect(provider.hentResultat(providerJobId)).rejects.toThrow(
      MOCK_VIDEO_FEJL,
    );
  });
});

describe("MockVideoProvider · webhook-payload-fixtures", () => {
  it("bygger faerdig-payload der matcher resultatet", async () => {
    const provider = new MockVideoProvider();
    const { providerJobId } = await provider.indsendJob(basisJob());
    const payload = provider.webhookPayload(providerJobId);
    expect(payload.udfald).toBe("faerdig");
    if (payload.udfald === "faerdig") {
      expect(payload.providerJobId).toBe(providerJobId);
      expect(payload.resultat.url).toContain(providerJobId);
      expect(payload.resultat.costDkk).toBe(mockKlipPrisDkk(8));
    }
  });

  it("bygger fejlet-payload med fejltekst", async () => {
    const provider = new MockVideoProvider({ fejler: true });
    const { providerJobId } = await provider.indsendJob(basisJob());
    const payload = provider.webhookPayload(providerJobId);
    expect(payload).toEqual({
      providerJobId,
      udfald: "fejlet",
      fejl: MOCK_VIDEO_FEJL,
    });
  });

  it("er deterministisk: samme job giver samme payload", async () => {
    const provider = new MockVideoProvider();
    const { providerJobId } = await provider.indsendJob(basisJob());
    expect(provider.webhookPayload(providerJobId)).toEqual(
      provider.webhookPayload(providerJobId),
    );
  });
});
