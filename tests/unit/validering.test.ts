import { describe, expect, it } from "vitest";
import { valider } from "@/lib/sikkerhed/validering";

// Streng inputvalidering (OWASP API3): ruter accepterer NØJAGTIG de felter
// de definerer — alt andet kasseres, så massetildeling er umulig.
describe("valider", () => {
  const skema = {
    navn: { slags: "tekst", min: 1, maks: 10 },
    antal: { slags: "tal", min: 1, maks: 100, heltal: true },
    note: { slags: "tekst", maks: 50, valgfri: true },
  } as const;

  it("kasserer ukendte felter — massetildeling er umulig", () => {
    const r = valider({ navn: "Mo", antal: 5, rolle: "admin", saldo: 9999 }, skema);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toEqual({ navn: "Mo", antal: 5 });
    expect("rolle" in r.data).toBe(false);
    expect("saldo" in r.data).toBe(false);
  });

  it("håndhæver længde- og talgrænser", () => {
    expect(valider({ navn: "for langt navn her", antal: 5 }, skema).ok).toBe(false);
    expect(valider({ navn: "Mo", antal: 999 }, skema).ok).toBe(false);
    expect(valider({ navn: "Mo", antal: 2.5 }, skema).ok).toBe(false);
    expect(valider({ antal: 5 }, skema).ok).toBe(false); // navn mangler
  });

  it("trimmer tekst", () => {
    const r = valider({ navn: "  Mo  ", antal: 1 }, skema);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.navn).toBe("Mo");
  });

  it("afviser ugyldige e-mails, uuid'er og enums", () => {
    expect(valider({ e: "ikke-en-mail" }, { e: { slags: "email" } }).ok).toBe(false);
    expect(valider({ e: "a@b.dk" }, { e: { slags: "email" } }).ok).toBe(true);
    expect(valider({ i: "abc" }, { i: { slags: "uuid" } }).ok).toBe(false);
    expect(
      valider({ v: "x" }, { v: { slags: "enum", vaerdier: ["a", "b"] } }).ok,
    ).toBe(false);
  });

  it("begrænser listers længde", () => {
    const listeSkema = {
      ids: { slags: "liste", af: { slags: "uuid" }, maks: 2 },
    } as const;
    const uuid = "11111111-1111-4111-8111-111111111111";
    expect(valider({ ids: [uuid, uuid] }, listeSkema).ok).toBe(true);
    expect(valider({ ids: [uuid, uuid, uuid] }, listeSkema).ok).toBe(false);
  });

  it("afviser ikke-objekter", () => {
    expect(valider(null, skema).ok).toBe(false);
    expect(valider([], skema).ok).toBe(false);
    expect(valider("tekst", skema).ok).toBe(false);
  });
});
