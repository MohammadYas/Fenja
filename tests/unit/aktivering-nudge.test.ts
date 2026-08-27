import { describe, expect, it } from "vitest";
import {
  NUDGE_EFTER_MS,
  NUDGE_MAKS_PR_KOERSEL,
  kanLeveresTil,
  koerAktiveringsNudge,
  type NudgeDb,
  type NudgeKandidat,
} from "@/lib/aktivering/nudge";

// Dataanalyse 27/8: begge ægte brugere gennemførte tilmelding og lagde aldrig
// et item op — intet i systemet fulgte op. Kontrakten for nudgen er: ÉT skub
// pr. bruger, aldrig to, aldrig til en adresse der bouncer, og én brugers fejl
// må aldrig standse resten af kørslen.

class FakeDb implements NudgeDb {
  stemplede: string[] = [];
  hentedeMed: { foer: string; maks: number } | null = null;
  constructor(
    private kandidater: NudgeKandidat[],
    private stemplingSvar: (id: string) => boolean | Promise<boolean> = () => true,
  ) {}
  async hentKandidater(foerIso: string, maks: number): Promise<NudgeKandidat[]> {
    this.hentedeMed = { foer: foerIso, maks };
    return this.kandidater;
  }
  async stempelNudget(userId: string): Promise<boolean> {
    const ok = await this.stemplingSvar(userId);
    if (ok) this.stemplede.push(userId);
    return ok;
  }
}

describe("kanLeveresTil sorterer adresser fra der bouncer", () => {
  it("accepterer almindelige adresser", () => {
    expect(kanLeveresTil("bruger@gmail.com")).toBe(true);
    expect(kanLeveresTil("navn@student.sdu.dk")).toBe(true);
  });

  it("afviser E2E-testkonti — bounces koster afsender-omdømme for de RIGTIGE mails", () => {
    expect(kanLeveresTil("selja-logintest-1786896554@example.com")).toBe(false);
    expect(kanLeveresTil("noget@test.com")).toBe(false);
  });

  it("afviser vrøvl uden at kaste", () => {
    expect(kanLeveresTil("ikke-en-mail")).toBe(false);
    expect(kanLeveresTil("")).toBe(false);
  });
});

describe("koerAktiveringsNudge sender ét skub — aldrig to", () => {
  it("henter kandidater ældre end vinduet og inden for loftet", async () => {
    const nu = new Date("2026-08-27T12:00:00.000Z").getTime();
    const db = new FakeDb([]);
    await koerAktiveringsNudge(db, async () => {}, nu);
    expect(db.hentedeMed?.maks).toBe(NUDGE_MAKS_PR_KOERSEL);
    expect(new Date(db.hentedeMed!.foer).getTime()).toBe(nu - NUDGE_EFTER_MS);
  });

  it("stempler FØR afsendelse, så et nedbrud aldrig kan sende to gange", async () => {
    const raekkefoelge: string[] = [];
    const db = new FakeDb([{ id: "u1", email: "en@gmail.com" }]);
    const oprindelig = db.stempelNudget.bind(db);
    db.stempelNudget = async (id: string) => {
      raekkefoelge.push("stempel");
      return oprindelig(id);
    };
    await koerAktiveringsNudge(db, async () => {
      raekkefoelge.push("send");
    });
    expect(raekkefoelge).toEqual(["stempel", "send"]);
  });

  it("springer over uden at stemple, når adressen ikke kan leveres til", async () => {
    const db = new FakeDb([{ id: "u1", email: "test@example.com" }]);
    const sendt: string[] = [];
    const r = await koerAktiveringsNudge(db, async (k) => {
      sendt.push(k.email);
    });
    expect(r).toEqual({ sendt: 0, sprunget: 1, fejlet: 0 });
    expect(sendt).toEqual([]);
    // Stemplet må IKKE sættes: adressen kan blive gyldig, og brugeren har
    // stadig aldrig fået sin nudge
    expect(db.stemplede).toEqual([]);
  });

  it("springer over når en anden kørsel vandt stemplet — ingen dublet", async () => {
    const db = new FakeDb([{ id: "u1", email: "en@gmail.com" }], () => false);
    const sendt: string[] = [];
    const r = await koerAktiveringsNudge(db, async (k) => {
      sendt.push(k.email);
    });
    expect(r).toEqual({ sendt: 0, sprunget: 1, fejlet: 0 });
    expect(sendt).toEqual([]);
  });

  it("én fejlet mail standser ALDRIG resten af kørslen", async () => {
    const db = new FakeDb([
      { id: "u1", email: "en@gmail.com" },
      { id: "u2", email: "to@gmail.com" },
      { id: "u3", email: "tre@gmail.com" },
    ]);
    const sendt: string[] = [];
    const r = await koerAktiveringsNudge(db, async (k) => {
      if (k.id === "u2") throw new Error("Resend nede");
      sendt.push(k.id);
    });
    expect(r).toEqual({ sendt: 2, sprunget: 0, fejlet: 1 });
    expect(sendt).toEqual(["u1", "u3"]);
  });

  it("tæller en fejlet stempling som fejlet og sender ikke", async () => {
    const db = new FakeDb([{ id: "u1", email: "en@gmail.com" }], () => {
      throw new Error("db nede");
    });
    const sendt: string[] = [];
    const r = await koerAktiveringsNudge(db, async (k) => {
      sendt.push(k.id);
    });
    expect(r).toEqual({ sendt: 0, sprunget: 0, fejlet: 1 });
    expect(sendt).toEqual([]);
  });
});
