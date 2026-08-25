import { afterEach, describe, expect, it, vi } from "vitest";
import { trial } from "@/lib/config";
import { laesTrialToken, signerTrialToken } from "@/lib/trial/cookie";
import { laesTrialFelter } from "@/lib/trial/form";
import { delvisBeskrivelse, delvisSoegeord } from "@/lib/trial/resultat";
import { verificerTurnstile } from "@/lib/trial/turnstile";
import {
  tjekTrialVaern,
  trialTokenHash,
  type TrialVaernDb,
} from "@/lib/trial/vaern";

// Fake-database til værnet: rækkerne styres af testen, og hvert opslag
// logges, så vi kan bevise at blokeringer stopper FØR de dyre opslag.
class FakeVaernDb implements TrialVaernDb {
  kald: string[] = [];
  constructor(
    private opsaetning: {
      indstillinger?: { aktiv: boolean; dagligtBudgetDkk: number } | null;
      forbrugDkk?: number;
      sidsteTime?: number;
      completedRaekker?: { kolonne: string; vaerdi: string }[];
      kaster?: boolean;
    } = {},
  ) {}

  async hentIndstillinger() {
    this.kald.push("indstillinger");
    if (this.opsaetning.kaster) throw new Error("db nede");
    return this.opsaetning.indstillinger === undefined
      ? { aktiv: true, dagligtBudgetDkk: 200 }
      : this.opsaetning.indstillinger;
  }

  async dagensForbrugDkk() {
    this.kald.push("forbrug");
    return this.opsaetning.forbrugDkk ?? 0;
  }

  async antalSidsteTime() {
    this.kald.push("time");
    return this.opsaetning.sidsteTime ?? 0;
  }

  async harCompleted(kolonne: string, vaerdi: string) {
    this.kald.push(`harCompleted:${kolonne}`);
    return (this.opsaetning.completedRaekker ?? []).some(
      (r) => r.kolonne === kolonne && r.vaerdi === vaerdi,
    );
  }
}

const KLIENT = { ipHash: "ip-a", fingerprintHash: "fp-a", cookieToken: null };

describe("trial-værn (alle checks server-side, ejer-krav 3+7)", () => {
  it("tillader en frisk besøgende når alt er åbent", async () => {
    const db = new FakeVaernDb();
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: true });
  });

  it("admin-toggle FRA afviser øjeblikkeligt — uden ét eneste videre opslag", async () => {
    const db = new FakeVaernDb({ indstillinger: { aktiv: false, dagligtBudgetDkk: 200 } });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "lukket" });
    expect(db.kald).toEqual(["indstillinger"]);
  });

  it("budgetloft nået afviser før alle person-opslag", async () => {
    const db = new FakeVaernDb({
      indstillinger: { aktiv: true, dagligtBudgetDkk: 10 },
      forbrugDkk: 10,
    });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "budget" });
    expect(db.kald).toEqual(["indstillinger", "forbrug"]);
  });

  it("budgetloftet regner det NÆSTE forsøg med (estimatet må ikke overskride loftet)", async () => {
    const db = new FakeVaernDb({
      indstillinger: { aktiv: true, dagligtBudgetDkk: 10 },
      forbrugDkk: 10 - trial.costEstimatDkk / 2,
    });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "budget" });
  });

  it("time-cappen (spike-beskyttelse) afviser", async () => {
    const db = new FakeVaernDb({ sidsteTime: trial.maksPrTime });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "time" });
  });

  it("samme IP med en COMPLETED trial inden for 7 dage afvises", async () => {
    const db = new FakeVaernDb({
      completedRaekker: [{ kolonne: "ip_hash", vaerdi: "ip-a" }],
    });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "ip" });
  });

  it("en FEJLET trial låser ikke IP'en (kun completed tæller)", async () => {
    // Fake'ens harCompleted svarer kun på completed-rækker — en fejlet kørsel
    // findes slet ikke i listen, præcis som i den rigtige forespørgsel
    const db = new FakeVaernDb({ completedRaekker: [] });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: true });
  });

  it("gyldig cookie fra en completed trial afvises som cookie-blok", async () => {
    const token = "11111111-2222-3333-4444-555555555555";
    const db = new FakeVaernDb({
      completedRaekker: [{ kolonne: "token_hash", vaerdi: trialTokenHash(token) }],
    });
    expect(await tjekTrialVaern(db, { ...KLIENT, cookieToken: token })).toEqual({
      tilladt: false,
      aarsag: "cookie",
    });
  });

  it("fingerprint-match er sekundært signal og blokerer", async () => {
    const db = new FakeVaernDb({
      completedRaekker: [{ kolonne: "fingerprint_hash", vaerdi: "fp-a" }],
    });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({
      tilladt: false,
      aarsag: "fingerprint",
    });
  });

  it("fejlsikret LUKKET: kan værnet ikke afgøres, afvises der (penge på spil)", async () => {
    const db = new FakeVaernDb({ kaster: true });
    expect(await tjekTrialVaern(db, KLIENT)).toEqual({ tilladt: false, aarsag: "lukket" });
  });
});

describe("signeret trial-cookie (værn b)", () => {
  const TOKEN = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  it("runder tur/retur", () => {
    expect(laesTrialToken(signerTrialToken(TOKEN, "s3"), "s3")).toBe(TOKEN);
  });

  it("afviser manipuleret token og forkert hemmelighed", () => {
    const vaerdi = signerTrialToken(TOKEN, "s3");
    expect(laesTrialToken(vaerdi.replace("aaaa", "ffff"), "s3")).toBeNull();
    expect(laesTrialToken(vaerdi, "anden")).toBeNull();
  });

  it("afviser støj og tomme værdier", () => {
    expect(laesTrialToken(null)).toBeNull();
    expect(laesTrialToken("")).toBeNull();
    expect(laesTrialToken("ikke.et.token")).toBeNull();
    // Gyldig signatur men ikke et uuid — vores tokens er altid uuids
    expect(laesTrialToken(signerTrialToken("DROP TABLE", "s3"), "s3")).toBeNull();
  });
});

describe("Turnstile server-side (ejer-krav 4: fail = afvis)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("afviser uden captcha-token", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "hemmelig");
    expect(await verificerTurnstile(null, null)).toBe(false);
  });

  it("uden konfigureret nøgle springes captchaen over (release 25/8 kører uden Cloudflare)", async () => {
    vi.stubEnv("MOCK_PROVIDERS", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verificerTurnstile(null, null)).toBe(true);
  });

  it("MED konfigureret nøgle håndhæves captchaen: manglende token afvises", async () => {
    vi.stubEnv("MOCK_PROVIDERS", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "hemmelig");
    expect(await verificerTurnstile(null, null)).toBe(false);
  });

  it("afviser når Cloudflare svarer success=false eller fejler", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "hemmelig");
    const nejFetch = (async () =>
      new Response(JSON.stringify({ success: false }))) as typeof fetch;
    expect(await verificerTurnstile("et-token", "1.2.3.4", { fetch: nejFetch })).toBe(false);
    const doedFetch = (async () => {
      throw new Error("net nede");
    }) as typeof fetch;
    expect(await verificerTurnstile("et-token", null, { fetch: doedFetch })).toBe(false);
  });

  it("godkender når Cloudflare siger success=true", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "hemmelig");
    const jaFetch = (async () =>
      new Response(JSON.stringify({ success: true }))) as typeof fetch;
    expect(await verificerTurnstile("et-token", null, { fetch: jaFetch })).toBe(true);
  });
});

describe("payload-whitelist (ejer-krav 8: intet klientstyret)", () => {
  it("læser KUN foto, captcha og skærm — model/opløsning/visning kasseres", () => {
    const form = new FormData();
    form.set("foto", new File([new Uint8Array([1, 2, 3])], "t.jpg", { type: "image/jpeg" }));
    form.set("captcha", "cf-token");
    form.set("skaerm", "390x844x3");
    // En angribers forsøg på at styre pipelinen — må aldrig nå nogen logik
    form.set("model", "gemini-pro");
    form.set("visning", "spejl");
    form.set("antal", "10");
    form.set("oploesning", "4096");

    const felter = laesTrialFelter(form);
    expect(Object.keys(felter).sort()).toEqual(["captchaToken", "foto", "skaerm"]);
    expect(felter.captchaToken).toBe("cf-token");
    expect(felter.skaerm).toBe("390x844x3");
    expect(felter.foto?.name).toBe("t.jpg");
  });

  it("afviser foto der ikke er en fil", () => {
    const form = new FormData();
    form.set("foto", "ikke-en-fil");
    expect(laesTrialFelter(form).foto).toBeNull();
  });
});

describe("delvis annoncetekst (de sidste 40 % forlader aldrig serveren)", () => {
  it("klipper ved ordskel omkring 60 %", () => {
    const tekst =
      "Fin blå striktrøje i god stand uden pletter eller huller. Sendes hurtigt med DAO eller GLS efter aftale med køberen.";
    const del = delvisBeskrivelse(tekst);
    expect(del.synlig.length).toBeLessThan(tekst.length);
    expect(del.synlig.length).toBeGreaterThan(tekst.length * 0.4);
    // Den skjulte del er reelt skjult: synlig + skjulteTegn dækker hele teksten
    expect(del.synlig.length + del.skjulteTegn).toBeGreaterThanOrEqual(tekst.length - 1);
    // Aldrig klippet midt i et ord
    expect(tekst.startsWith(del.synlig)).toBe(true);
    expect([" ", undefined]).toContain(tekst[del.synlig.length]);
  });

  it("kort tekst vises helt", () => {
    expect(delvisBeskrivelse("Kort tekst.", 0.6).skjulteTegn).toBeGreaterThanOrEqual(0);
    expect(delvisBeskrivelse("Hej", 1)).toEqual({ synlig: "Hej", skjulteTegn: 0 });
  });

  it("søgeord: 3 synlige, resten tælles kun", () => {
    expect(delvisSoegeord(["a", "b", "c", "d", "e"])).toEqual({
      synlige: ["a", "b", "c"],
      skjulte: 2,
    });
  });
});
