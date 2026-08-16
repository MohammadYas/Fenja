export type VareGruppeId =
  | "toej"
  | "sko"
  | "tasker"
  | "accessories"
  | "boern-baby";

export type PromptFamilie =
  | "overdel"
  | "underdel"
  | "kjole"
  | "overtoej"
  | "sport-bad"
  | "undertoej-nattoej"
  | "sko"
  | "taske"
  | "accessory"
  | "barn-produkt";

export type VareGruppe = {
  id: VareGruppeId;
  label: string;
};

export type Varetype = {
  id: string;
  label: string;
  kategori: string;
  gruppeId: VareGruppeId;
  promptFamilie: PromptFamilie;
};

export const VAREGRUPPER = [
  { id: "toej", label: "Tøj" },
  { id: "sko", label: "Sko" },
  { id: "tasker", label: "Tasker" },
  { id: "accessories", label: "Accessories" },
  { id: "boern-baby", label: "Børn og baby" },
] as const satisfies readonly VareGruppe[];

export const VARETYPER = [
  { id: "toppe-t-shirts", label: "Toppe og T-shirts", kategori: "Toppe og T-shirts", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "skjorter-bluser", label: "Skjorter og bluser", kategori: "Skjorter og bluser", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "strik-cardigans", label: "Strik og cardigans", kategori: "Strik og cardigans", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "sweatshirts-hoodies", label: "Sweatshirts og hoodies", kategori: "Sweatshirts og hoodies", gruppeId: "toej", promptFamilie: "overdel" },
  { id: "bukser-jeans", label: "Bukser og jeans", kategori: "Bukser og jeans", gruppeId: "toej", promptFamilie: "underdel" },
  { id: "shorts", label: "Shorts", kategori: "Shorts", gruppeId: "toej", promptFamilie: "underdel" },
  { id: "nederdele", label: "Nederdele", kategori: "Nederdele", gruppeId: "toej", promptFamilie: "kjole" },
  { id: "kjoler-heldragter", label: "Kjoler og heldragter", kategori: "Kjoler og heldragter", gruppeId: "toej", promptFamilie: "kjole" },
  { id: "jakker-blazere-veste", label: "Jakker, blazere og veste", kategori: "Jakker, blazere og veste", gruppeId: "toej", promptFamilie: "overtoej" },
  { id: "frakker-overtoej", label: "Frakker og overtøj", kategori: "Frakker og overtøj", gruppeId: "toej", promptFamilie: "overtoej" },
  { id: "sportstoej", label: "Sportstøj", kategori: "Sportstøj", gruppeId: "toej", promptFamilie: "sport-bad" },
  { id: "badetoej", label: "Badetøj", kategori: "Badetøj", gruppeId: "toej", promptFamilie: "sport-bad" },
  { id: "undertoej-nattoej", label: "Undertøj og nattøj", kategori: "Undertøj og nattøj", gruppeId: "toej", promptFamilie: "undertoej-nattoej" },
  { id: "sneakers", label: "Sneakers", kategori: "Sneakers", gruppeId: "sko", promptFamilie: "sko" },
  { id: "sko", label: "Sko", kategori: "Sko", gruppeId: "sko", promptFamilie: "sko" },
  { id: "stoevler", label: "Støvler", kategori: "Støvler", gruppeId: "sko", promptFamilie: "sko" },
  { id: "sandaler", label: "Sandaler", kategori: "Sandaler", gruppeId: "sko", promptFamilie: "sko" },
  { id: "haand-skuldertasker", label: "Hånd- og skuldertasker", kategori: "Hånd- og skuldertasker", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "rygsaekke", label: "Rygsække", kategori: "Rygsække", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "andre-tasker", label: "Andre tasker", kategori: "Andre tasker", gruppeId: "tasker", promptFamilie: "taske" },
  { id: "baelter-toerklaeder-hovedbeklaedning", label: "Bælter, tørklæder og hovedbeklædning", kategori: "Bælter, tørklæder og hovedbeklædning", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "smykker-ure-solbriller", label: "Smykker, ure og solbriller", kategori: "Smykker, ure og solbriller", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "andre-accessories", label: "Andre accessories", kategori: "Andre accessories", gruppeId: "accessories", promptFamilie: "accessory" },
  { id: "boern-toej", label: "Tøj", kategori: "Børne- og babytøj", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-overtoej", label: "Overtøj", kategori: "Børne- og babyovertøj", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-sko", label: "Sko", kategori: "Børne- og babysko", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
  { id: "boern-accessories", label: "Accessories", kategori: "Børne- og babyaccessories", gruppeId: "boern-baby", promptFamilie: "barn-produkt" },
] as const satisfies readonly Varetype[];

export function hentVaretype(id: string | null | undefined): Varetype | undefined {
  return VARETYPER.find((varetype) => varetype.id === id);
}

export function hentVaretyperForGruppe(gruppeId: string): readonly Varetype[] {
  return VARETYPER.filter((varetype) => varetype.gruppeId === gruppeId);
}

export function hentVaretypeFraKategori(
  kategori: string | null | undefined,
): Varetype | undefined {
  const normaliseret = (kategori ?? "").trim().toLocaleLowerCase("da");
  return VARETYPER.find(
    (varetype) => varetype.kategori.toLocaleLowerCase("da") === normaliseret,
  );
}
