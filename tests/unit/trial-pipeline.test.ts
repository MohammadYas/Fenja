import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trial } from "@/lib/config";
import { STANDARD_PRESET_ID, hentPreset } from "@/lib/pipeline/presets";
import { bygOnModelPromptMedSkabelon } from "@/lib/pipeline/skabeloner";
import { MockImageProvider, MockTextProvider } from "@/lib/providers/mock";
import type { TrialAnalyse } from "@/lib/trial/analyse";
import {
  TrialTidsFejl,
  koerTrialGenerering,
  trialBilledModel,
  trialVisning,
  type TrialDeps,
} from "@/lib/trial/pipeline";

const ANALYSE: TrialAnalyse = {
  kategori: "striktrøje",
  maerke: null,
  farve: "blå",
  stand: "God",
  beskrivelse: "Blå striktrøje med rund hals",
  costDkk: 0.02,
};

function deps(overrides: Partial<TrialDeps> = {}): TrialDeps & {
  image: MockImageProvider;
  text: MockTextProvider;
} {
  return {
    image: new MockImageProvider(),
    text: new MockTextProvider(),
    analyse: async () => ANALYSE,
    ...overrides,
  } as TrialDeps & { image: MockImageProvider; text: MockTextProvider };
}

describe("trial-pipelinen er den BILLIGE vej (ejer-krav 6+11)", () => {
  it("leverer billede + tekst + pris med præcis ét billedkald", async () => {
    const d = deps();
    const leverance = await koerTrialGenerering(d, "trial-1", "data:image/jpeg;base64,AAAA");

    expect(leverance.billedeUrl).toContain("#onmodel");
    expect(leverance.tekst.prisforslagDkk.fra).toBeGreaterThan(0);
    expect(leverance.tekst.titel.length).toBeGreaterThan(0);
    expect(leverance.costDkk).toBeGreaterThan(0);

    // Ét billede, ingen varianter — og ALDRIG den dyre flerbillede-rens
    expect(d.image.kald.filter((k) => k.startsWith("onmodel"))).toHaveLength(1);
    expect(d.image.kald.filter((k) => k.startsWith("rens"))).toHaveLength(0);
    // Intet troskabstjek og ingen label-aflæsning — begge koster vision-kald
    expect(d.text.kald).toEqual(["tekst"]);
  });

  it("fejler ærligt ved provider-fejl — ét forsøg, INGEN automatisk retry", async () => {
    const d = deps({ image: new MockImageProvider({ onModelFejler: true }) }) as ReturnType<
      typeof deps
    >;
    await expect(
      koerTrialGenerering(d, "trial-2", "data:image/jpeg;base64,AAAA"),
    ).rejects.toThrow();
    expect(d.image.kald.filter((k) => k.startsWith("onmodel"))).toHaveLength(1);
  });

  it("60-sekunders loftet: hænger provideren, kastes TrialTidsFejl", async () => {
    const aldrig = new Promise<never>(() => {});
    const d = deps({
      image: {
        rensBaggrund: () => aldrig,
        genererOnModel: () => aldrig,
      },
    });
    await expect(
      koerTrialGenerering(d, "trial-3", "data:image/jpeg;base64,AAAA", 30),
    ).rejects.toThrow(TrialTidsFejl);
  });

  it("annonceteksten består valideringen uden mærke og størrelse (foto-only flow)", async () => {
    const d = deps();
    const leverance = await koerTrialGenerering(d, "trial-4", "data:image/jpeg;base64,AAAA");
    expect(leverance.tekst.beskrivelse.length).toBeGreaterThan(0);
  });
});

describe("hårdkodet stil og model (ejer-krav 1+8)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("visningen er 'liggende' (gulv/flat-lay) — en produkt-visning uden person", () => {
    const visning = trialVisning();
    expect(visning.id).toBe("gulv");
    expect(visning.slags).toBe("produkt");
  });

  it("prompten er flat-lay-framingen og forbyder personer i billedet", () => {
    const prompt = bygOnModelPromptMedSkabelon({
      preset: hentPreset(STANDARD_PRESET_ID),
      itemId: "trial-x",
      kategori: ANALYSE.kategori,
      visning: trialVisning(),
    });
    expect(prompt).toContain("laid out flat");
    expect(prompt).toContain("No person appears in the image");
    // Spejl-instruksen (den dyre onmodel-stil) må ALDRIG optræde i en trial
    expect(prompt).not.toContain("mirror selfie");
  });

  it("modellen er den billige gemini-flash når nøglen findes", () => {
    vi.stubEnv("GEMINI_API_KEY", "nøgle");
    expect(trialBilledModel().id).toBe(trial.billedModelId);
  });

  it("uden Gemini-nøgle bruges den billige fal-reserve — aldrig pro-modellen", () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("FAL_KEY", "nøgle");
    expect(trialBilledModel().id).toBe(trial.billedModelReserveId);
  });
});

describe("trialen kan ALDRIG trigge betalings-pipelinen (ejer-krav 11)", () => {
  const kilde = (sti: string): string =>
    readFileSync(fileURLToPath(new URL(`../../${sti}`, import.meta.url)), "utf8");

  /** Alle module-referencer i filen: statiske imports OG dynamiske import() */
  const importerede = (sti: string): string[] => {
    const indhold = kilde(sti);
    return [
      ...indhold.matchAll(/from\s+"([^"]+)"|import\("([^"]+)"\)/g),
    ].map((m) => m[1] ?? m[2]!);
  };

  it("trial-kørslen importerer hverken kreditter, ledger eller item-pipelinen", () => {
    for (const sti of ["lib/trial/pipeline.ts", "lib/trial/koersel.ts", "lib/trial/start.ts"]) {
      const moduler = importerede(sti);
      expect(moduler, sti).not.toContain("@/lib/credits/ledger");
      expect(moduler, sti).not.toContain("@/lib/credits/supabase");
      expect(moduler, sti).not.toContain("@/lib/pipeline/run");
      expect(moduler, sti).not.toContain("@/lib/pipeline/start");
    }
  });

  it("/api/prov kender ikke betalings-pipelinen og læser kun whitelist-felterne", () => {
    const moduler = importerede("app/api/prov/route.ts");
    expect(moduler).not.toContain("@/lib/credits/ledger");
    expect(moduler).not.toContain("@/lib/credits/supabase");
    expect(moduler).not.toContain("@/lib/pipeline/run");
    expect(moduler).not.toContain("@/lib/pipeline/start");
    // Payload-læsningen går gennem whitelist-læseren — aldrig request.json frit
    expect(kilde("app/api/prov/route.ts")).toContain("laesTrialFelter");
  });
});
