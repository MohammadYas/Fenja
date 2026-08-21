// Salgsstatistik (abonnent-fordel, lovet i "Med i begge" — bygget 21/8).
// Rene funktioner over brugerens egne annoncer + markedshøsten, så panelet
// kan testes uden database.

import { findMarkedsinterval } from "@/lib/pipeline/markedspriser";

export type StatistikInputItem = {
  status: "draft" | "active" | "sold";
  soldPrisDkk: number | null;
  solgtAt: string | null;
  leveretAt: string | null;
  createdAt: string;
  maerke: string;
  kategori: string;
  /** Annonce-tekstens øvre prisforslag — bruges som aktiv værdi */
  prisTilDkk: number | null;
};

export type Salgsstatistik = {
  solgtAntal: number;
  solgtSumDkk: number;
  /** Median-dage fra leverance til salg — null uden solgte med tidsstempler */
  medianLiggetidDage: number | null;
  /** Kategori med største solgte sum — null uden salg */
  bedsteKategori: { navn: string; sumDkk: number } | null;
  /** Aktive annoncers samlede forventede værdi (prisforslag, ellers markeds-median) */
  aktivVaerdiDkk: number;
  aktivAntal: number;
};

export function bygSalgsstatistik(
  items: readonly StatistikInputItem[],
  nu: Date = new Date(),
): Salgsstatistik {
  void nu;
  const solgte = items.filter((i) => i.status === "sold");
  const solgtSumDkk = solgte.reduce((sum, i) => sum + (i.soldPrisDkk ?? 0), 0);

  const liggetider = solgte
    .filter((i) => i.solgtAt && (i.leveretAt ?? i.createdAt))
    .map((i) => {
      const fra = new Date(i.leveretAt ?? i.createdAt).getTime();
      const til = new Date(i.solgtAt as string).getTime();
      return Math.max(0, Math.round((til - fra) / 86_400_000));
    })
    .sort((a, b) => a - b);
  const medianLiggetidDage =
    liggetider.length > 0 ? liggetider[Math.floor(liggetider.length / 2)]! : null;

  const prKategori = new Map<string, number>();
  for (const item of solgte) {
    const navn = item.kategori.trim() || "Andet";
    prKategori.set(navn, (prKategori.get(navn) ?? 0) + (item.soldPrisDkk ?? 0));
  }
  const bedste = [...prKategori.entries()].sort((a, b) => b[1] - a[1])[0];
  const bedsteKategori =
    bedste && bedste[1] > 0 ? { navn: bedste[0], sumDkk: bedste[1] } : null;

  const aktive = items.filter((i) => i.status === "active");
  const aktivVaerdiDkk = aktive.reduce((sum, i) => {
    if (i.prisTilDkk != null) return sum + i.prisTilDkk;
    const interval = findMarkedsinterval(i.maerke, i.kategori);
    return sum + (interval?.medianDkk ?? 0);
  }, 0);

  return {
    solgtAntal: solgte.length,
    solgtSumDkk,
    medianLiggetidDage,
    bedsteKategori,
    aktivVaerdiDkk,
    aktivAntal: aktive.length,
  };
}
